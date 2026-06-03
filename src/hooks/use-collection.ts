import { fetchCollectionById } from '@/lib/collections';
import type { Collection } from '@/types/collection';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useCollection(collectionId: string | undefined) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (options?: { refreshing?: boolean }) => {
      if (!collectionId) {
        setCollection(null);
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
        const data = await fetchCollectionById(collectionId);
        setCollection(data);
        if (!data) {
          setError('Collection not found.');
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load collection';
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
    collection,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
