-- public.can_collaborate_on_collection(collection_id, user_id)
-- Returns true if the user is a collaborator on the given collection.

create or replace function public.can_collaborate_on_collection(collection_id uuid, user_id uuid)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.collection_collaborators cc
    where cc.collection_id = collection_id
      and cc.user_id = user_id
  );
$$;

comment on function public.can_collaborate_on_collection(uuid, uuid)
  is 'Returns true if user_id is a collaborator on the collection.';

