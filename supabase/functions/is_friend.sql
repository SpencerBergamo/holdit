-- public.is_friend(user_a_id, user_b_id)
-- Returns true if there is a friendship between the two users.

create or replace function public.is_friend(user_a_id uuid, user_b_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  a uuid;
  b uuid;
begin
  if user_a_id is null or user_b_id is null then
    return false;
  end if;

  -- Normalize so that a < b to match friendships constraint.
  if user_a_id < user_b_id then
    a := user_a_id;
    b := user_b_id;
  elsif user_b_id < user_a_id then
    a := user_b_id;
    b := user_a_id;
  else
    -- same user, not considered a "friendship"
    return false;
  end if;

  return exists (
    select 1
    from public.friendships f
    where f.user_a_id = a
      and f.user_b_id = b
  );
end;
$$;

comment on function public.is_friend(uuid, uuid)
  is 'Returns true if two users are friends based on public.friendships.';

