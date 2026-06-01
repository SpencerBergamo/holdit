-- public.can_view_collection(collection_id, user_id)
-- Returns true if the user can view the collection:
--  * is the owner
--  * is a collaborator
--  * OR collection.visible_to_friends = true AND user is a friend of the owner

create or replace function public.can_view_collection(collection_id uuid, user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  owner uuid;
begin
  if collection_id is null or user_id is null then
    return false;
  end if;

  -- Owner always can view
  if public.is_collection_owner(collection_id, user_id) then
    return true;
  end if;

  -- Collaborators can view
  if public.can_collaborate_on_collection(collection_id, user_id) then
    return true;
  end if;

  -- Visible-to-friends check
  select c.owner_id
  into owner
  from public.collections c
  where c.id = collection_id
    and c.visible_to_friends = true;

  if owner is null then
    return false;
  end if;

  return public.is_friend(owner, user_id);
end;
$$;

comment on function public.can_view_collection(uuid, uuid)
  is 'Returns true if user_id can view the specified collection (owner, collaborator, or friend when visible_to_friends).';

