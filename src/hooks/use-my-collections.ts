import { fetchMyCollections } from '@/lib/collections';
import type { CollectionWithSaveCount } from '@/types/collection';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useMyCollections() {
  const [collections, setCollections] = useState<CollectionWithSaveCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (options?: { refreshing?: boolean }) => {
    const refreshing = options?.refreshing ?? false;

    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchMyCollections();
      setCollections(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load collections';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const refresh = useCallback(() => load({ refreshing: true }), [load]);

  return {
    collections,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
