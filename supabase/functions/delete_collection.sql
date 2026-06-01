-- public.delete_collection(target_collection_id)
-- Deletes a collection after verifying ownership and cleans up related data.

create or replace function public.delete_collection(target_collection_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_owner uuid;
begin
  if target_collection_id is null then
    raise exception 'target_collection_id is required';
  end if;

  select owner_id into v_owner
  from public.collections
  where id = target_collection_id;

  if v_owner is null then
    raise exception 'Collection not found';
  end if;

  if v_owner <> auth.uid() then
    raise exception 'Not authorized to delete this collection';
  end if;

  -- Because FKs are ON DELETE CASCADE, deleting the collection will
  -- cascade to collection_memberships, collaborators, requests, and invite links.
  delete from public.collections
  where id = target_collection_id;

  -- Delete orphan saves owned by this user that are no longer in any collection.
  delete from public.saves s
  where s.owner_id = v_owner
    and not exists (
      select 1
      from public.collection_memberships cm
      where cm.save_id = s.id
    );
end;
$$;

comment on function public.delete_collection(uuid)
  is 'Deletes a collection (owner only) and prunes orphan saves belonging to the owner.';

