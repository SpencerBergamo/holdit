-- Private-ish capture photos: public read for simple client Image URLs; writes scoped to owner folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'captures',
  'captures',
  true,
  52428800,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- SELECT: anyone with the URL can read (required for getPublicUrl in the mobile client)
create policy captures_public_read on storage.objects
  for select
  using (bucket_id = 'captures');

-- INSERT: authenticated users only, under their user-id prefix
create policy captures_owner_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE / DELETE: same folder ownership
create policy captures_owner_update on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy captures_owner_delete on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
