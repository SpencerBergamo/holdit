-- Seed data for local development
--
-- Inserts proper auth.users rows so the handle_new_user trigger auto-creates
-- matching profiles. Password for both users: "password123"
--
-- The encrypted_password below is bcrypt('password123') — safe for local dev only.

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'alice@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"display_name": "Alice"}'::jsonb,
    now(),
    now(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'bob@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"display_name": "Bob"}'::jsonb,
    now(),
    now(),
    '',
    ''
  )
on conflict (id) do nothing;

-- The handle_new_user trigger creates profiles automatically.
-- Insert identities so Supabase Auth recognises these as email accounts.

insert into auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'alice@example.com',
    'email',
    jsonb_build_object('sub', '00000000-0000-0000-0000-000000000001', 'email', 'alice@example.com'),
    now(),
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'bob@example.com',
    'email',
    jsonb_build_object('sub', '00000000-0000-0000-0000-000000000002', 'email', 'bob@example.com'),
    now(),
    now(),
    now()
  )
on conflict do nothing;

-- Collections for Alice

insert into public.collections (id, owner_id, name, description, visible_to_friends)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Birthday', 'Birthday wishlist', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Christmas', 'Christmas ideas', true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Private Ideas', 'Only Alice can see this', false)
on conflict (id) do nothing;

-- Saves for Alice

insert into public.saves (id, owner_id, product_snapshot, notes)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', jsonb_build_object('title', 'Noise-cancelling headphones'), 'Over-ear, black'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', jsonb_build_object('title', 'Coffee grinder'), 'Burr grinder'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', jsonb_build_object('title', 'Cookbook'), 'Vegetarian recipes')
on conflict (id) do nothing;

-- Memberships linking saves to collections with different states

insert into public.collection_memberships
  (save_id, collection_id, sort_position, claimed_by, claimed_at, purchased_by, purchased_at, added_by)
values
  -- Unclaimed save
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, null, null, null, null,
   '00000000-0000-0000-0000-000000000001'),
  -- Claimed by Bob
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 2,
   '00000000-0000-0000-0000-000000000002', now(), null, null,
   '00000000-0000-0000-0000-000000000001'),
  -- Purchased by Bob
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 1,
   '00000000-0000-0000-0000-000000000002', now(),
   '00000000-0000-0000-0000-000000000002', now(),
   '00000000-0000-0000-0000-000000000001')
on conflict (save_id, collection_id) do nothing;

-- Friendship between Alice and Bob

insert into public.friendships (user_a_id, user_b_id)
values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002')
on conflict do nothing;

-- Pending friend request (from Bob to Alice)

insert into public.friend_requests (id, sender_id, receiver_id, status)
values ('30000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'pending')
on conflict (id) do nothing;

-- Collaborator: Bob collaborates on Alice's Birthday collection

insert into public.collection_collaborators (collection_id, user_id, granted_via, granted_at)
values ('10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        'direct',
        now())
on conflict (collection_id, user_id) do nothing;

-- Collaborate request from Bob on another collection

insert into public.collaborate_requests (id, collection_id, requester_id, status)
values ('30000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        'pending')
on conflict (id) do nothing;

-- Invite link for Birthday collection

insert into public.collection_invite_links (id, collection_id, created_by, token)
values ('40000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '50000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

