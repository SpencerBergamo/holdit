-- public.is_collection_owner(collection_id, user_id)
-- Returns true if the given user owns the collection.

create or replace function public.is_collection_owner(collection_id uuid, user_id uuid)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.owner_id = user_id
  );
$$;

comment on function public.is_collection_owner(uuid, uuid)
  is 'Returns true if user_id is the owner of the collection.';

