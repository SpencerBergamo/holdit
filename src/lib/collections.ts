import type { Collection, CollectionWithSaveCount } from '@/types/collection';
import { supabase } from '@/utils/supabase';

type CollectionMembershipCount = {
  count: number;
};

type CollectionRow = Collection & {
  collection_memberships: CollectionMembershipCount[];
};

function mapCollectionRow(row: CollectionRow): CollectionWithSaveCount {
  const { collection_memberships, ...collection } = row;
  const save_count = collection_memberships[0]?.count ?? 0;
  return { ...collection, save_count };
}

/**
 * Loads collections owned by the signed-in user, with membership counts for list UI.
 * RLS on `collections` should scope rows to the current user; we still filter by `owner_id`.
 */
export async function fetchMyCollections(): Promise<CollectionWithSaveCount[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('You must be signed in to view collections.');
  }

  const { data, error } = await supabase
    .from('collections')
    .select(
      `
      id,
      owner_id,
      name,
      description,
      visible_to_friends,
      created_at,
      updated_at,
      collection_memberships (count)
    `,
    )
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as CollectionRow[]).map(mapCollectionRow);
}
