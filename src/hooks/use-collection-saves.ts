import { fetchCollectionSaves } from '@/lib/saves';
import type { Save } from '@/types/save';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useCollectionSaves(collectionId: string | undefined) {
  const [saves, setSaves] = useState<Save[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (options?: { refreshing?: boolean }) => {
      if (!collectionId) {
        setSaves([]);
        setIsLoading(false);
        setError('Collection not found.');
        return;
      }

      const refreshing = options?.refreshing ?? false;

      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchCollectionSaves(collectionId);
        setSaves(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load saves';
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [collectionId],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const refresh = useCallback(() => load({ refreshing: true }), [load]);

  return {
    saves,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
