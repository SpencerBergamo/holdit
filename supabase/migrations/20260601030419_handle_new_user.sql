-- Auto-create a public.profiles row whenever a new auth user is created.
-- Defaults display_name to the part before '@' in the email.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

comment on function public.handle_new_user()
  is 'Creates a profiles row for every new auth user. Reads display_name from user_metadata or falls back to the email prefix.';

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();