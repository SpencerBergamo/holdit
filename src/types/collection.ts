/**
 * `collections` row shape (ADR 0002).
 * Field names match Supabase/Postgres JSON so the same type works for API responses,
 * inserts, and app state without renaming at the boundary.
 *
 * @see docs/adr/0002-collections-storage-in-supabase.md
 */
export type Collection = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  visible_to_friends: boolean;
  created_at: string;
  updated_at: string;
};

/** Fields required when inserting a new `collections` row (server sets id and timestamps). */
export type CollectionInsert = Pick<
  Collection,
  'name' | 'description' | 'visible_to_friends'
> & {
  owner_id: string;
};

/** Partial update of mutable `collections` columns. */
export type CollectionUpdate = Partial<
  Pick<Collection, 'name' | 'description' | 'visible_to_friends'>
>;

/**
 * Collection plus list UI fields from queries (not stored on `collections`).
 * e.g. `count` on `collection_memberships` for the current user/viewer.
 */
export type CollectionWithSaveCount = Collection & {
  save_count: number;
};
