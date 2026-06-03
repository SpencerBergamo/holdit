import type {
  Collection,
  CollectionInsert,
  CollectionWithSaveCount,
} from '@/types/collection';
import { supabase } from '@/utils/supabase';

export type CreateCollectionInput = Pick<
  CollectionInsert,
  'name' | 'description' | 'visible_to_friends'
>;

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

/**
 * Creates a collection owned by the signed-in user.
 * Anonymous users are limited to one collection and cannot be friend-visible (ADR 0002).
 */
export async function createCollection(
  input: CreateCollectionInput,
): Promise<Collection> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('You must be signed in to create a collection.');
  }

  const name = input.name.trim();
  if (!name) {
    throw new Error('Collection name is required.');
  }

  const description = input.description?.trim() || null;
  let visibleToFriends = input.visible_to_friends;

  if (user.is_anonymous) {
    visibleToFriends = false;

    const { count, error: countError } = await supabase
      .from('collections')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id);

    if (countError) {
      throw countError;
    }

    if ((count ?? 0) >= 1) {
      throw new Error('Sign up to create more than one collection.');
    }
  }

  const { data, error } = await supabase
    .from('collections')
    .insert({
      owner_id: user.id,
      name,
      description,
      visible_to_friends: visibleToFriends,
    })
    .select(
      `
      id,
      owner_id,
      name,
      description,
      visible_to_friends,
      created_at,
      updated_at
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Loads a single collection by id for the signed-in user (RLS-scoped).
 */
export async function fetchCollectionById(
  collectionId: string,
): Promise<Collection | null> {
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
      updated_at
    `,
    )
    .eq('id', collectionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
