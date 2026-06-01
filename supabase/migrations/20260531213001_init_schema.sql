-- 20260531213001_init_schema.sql
-- Initial HoldIt schema: core tables, FKs, triggers, basic RLS

-- Extensions -----------------------------------------------------------------

create extension if not exists "pgcrypto";

-- Helper trigger function ----------------------------------------------------

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.update_updated_at_column()
  is 'Standard trigger to bump updated_at on row updates.';

-- 1. profiles ----------------------------------------------------------------

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text        not null,
  avatar_url   text,
  birthday     date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Public user profile fields extending auth.users.';
comment on column public.profiles.id is 'FK to auth.users.id.';
comment on column public.profiles.display_name is 'Public-facing display name.';
comment on column public.profiles.avatar_url is 'Avatar image URL.';
comment on column public.profiles.birthday is 'Birthday (month/day only used at app level).';

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.update_updated_at_column();

-- 2. saves -------------------------------------------------------------------

create table public.saves (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  product_snapshot jsonb,
  variant_details  jsonb,
  notes            text,
  capture_data     jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.saves is 'A single item a user wants, including merchant/product snapshot.';
comment on column public.saves.owner_id is 'User who owns this save.';

create index saves_owner_id_idx on public.saves (owner_id);

create trigger saves_set_updated_at
before update on public.saves
for each row
execute procedure public.update_updated_at_column();

-- 3. collections -------------------------------------------------------------

create table public.collections (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  description       text,
  visible_to_friends boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.collections is 'User-owned list of saves (e.g., Birthday, Wishlist).';
comment on column public.collections.visible_to_friends is 'If true, mutual friends can view this collection.';

create index collections_owner_id_idx on public.collections (owner_id);

create trigger collections_set_updated_at
before update on public.collections
for each row
execute procedure public.update_updated_at_column();

-- 4. collection_memberships --------------------------------------------------

create table public.collection_memberships (
  save_id       uuid not null references public.saves(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  sort_position integer,
  claimed_by    uuid references auth.users(id),
  claimed_at    timestamptz,
  purchased_by  uuid references auth.users(id),
  purchased_at  timestamptz,
  added_by      uuid not null references auth.users(id),
  added_at      timestamptz not null default now(),
  primary key (save_id, collection_id)
);

comment on table public.collection_memberships is 'Join table linking saves to collections with per-membership state.';

create index collection_memberships_collection_id_idx on public.collection_memberships (collection_id);

-- 5. friend_requests ---------------------------------------------------------

create table public.friend_requests (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references auth.users(id) on delete cascade,
  receiver_id   uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'pending',
  sent_at       timestamptz not null default now(),
  responded_at  timestamptz,
  constraint friend_requests_unique_pair unique (sender_id, receiver_id)
);

comment on table public.friend_requests is 'Pending, accepted, or declined friend connections.';

create index friend_requests_sender_idx on public.friend_requests (sender_id);
create index friend_requests_receiver_idx on public.friend_requests (receiver_id);

-- 6. friendships -------------------------------------------------------------

create table public.friendships (
  user_a_id  uuid not null references auth.users(id) on delete cascade,
  user_b_id  uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friendships_pk primary key (user_a_id, user_b_id),
  constraint friendships_canonical_pair check (user_a_id < user_b_id)
);

comment on table public.friendships is 'Established mutual friendships stored in canonical order.';

create index friendships_user_a_idx on public.friendships (user_a_id);
create index friendships_user_b_idx on public.friendships (user_b_id);

create or replace function public.friendships_normalize_pair()
returns trigger
language plpgsql
as $$
begin
  if new.user_a_id > new.user_b_id then
    -- swap to enforce user_a_id < user_b_id
    declare tmp uuid;
  begin
    tmp := new.user_a_id;
    new.user_a_id := new.user_b_id;
    new.user_b_id := tmp;
  end;
  end if;
  return new;
end;
$$;

create trigger friendships_normalize_pair_trg
before insert on public.friendships
for each row
execute procedure public.friendships_normalize_pair();

-- 7. collection_collaborators -----------------------------------------------

create table public.collection_collaborators (
  collection_id uuid not null references public.collections(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  granted_via   text not null,
  invite_link_id uuid,
  granted_at    timestamptz not null default now(),
  constraint collection_collaborators_pk primary key (collection_id, user_id)
);

comment on table public.collection_collaborators is 'Users with collaboration rights on a collection.';

create index collection_collaborators_user_idx on public.collection_collaborators (user_id);

-- 8. collaborate_requests ----------------------------------------------------

create table public.collaborate_requests (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  requester_id  uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'pending',
  requested_at  timestamptz not null default now(),
  responded_at  timestamptz,
  constraint collaborate_requests_unique unique (collection_id, requester_id)
);

comment on table public.collaborate_requests is 'Requests from friends to collaborate on a collection.';

create index collaborate_requests_collection_idx on public.collaborate_requests (collection_id);
create index collaborate_requests_requester_idx on public.collaborate_requests (requester_id);

-- 9. collection_invite_links -------------------------------------------------

create table public.collection_invite_links (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  created_by    uuid not null references auth.users(id) on delete cascade,
  token         uuid not null unique,
  revoked_at    timestamptz,
  created_at    timestamptz not null default now()
);

comment on table public.collection_invite_links is 'Invite links to collaborate on a collection.';

create index collection_invite_links_collection_idx on public.collection_invite_links (collection_id);
create index collection_invite_links_created_by_idx on public.collection_invite_links (created_by);

-- 7b. back-reference FK for collection_collaborators.invite_link_id ----------

alter table public.collection_collaborators
  add constraint collection_collaborators_invite_fk
  foreign key (invite_link_id)
  references public.collection_invite_links(id);

-- 10. notifications ----------------------------------------------------------

create table public.notifications (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  type      text not null,
  data      jsonb,
  read_at   timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'In-app alerts about gift or social activity.';

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);

-- 11. reports ----------------------------------------------------------------

create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid references auth.users(id),
  reported_save_id uuid references public.saves(id) on delete set null,
  reason           text not null,
  status           text not null default 'pending',
  created_at       timestamptz not null default now(),
  constraint reports_target_check
    check (reported_user_id is not null or reported_save_id is not null)
);

comment on table public.reports is 'User reports on other users or saves.';

create index reports_reporter_idx on public.reports (reporter_id);

-- 12. blocks -----------------------------------------------------------------

create table public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_pk primary key (blocker_id, blocked_id)
);

comment on table public.blocks is 'Records when one user blocks another.';

create index blocks_blocked_idx on public.blocks (blocked_id);

-- Row Level Security ---------------------------------------------------------

alter table public.profiles               enable row level security;
alter table public.saves                  enable row level security;
alter table public.collections            enable row level security;
alter table public.collection_memberships enable row level security;
alter table public.friend_requests        enable row level security;
alter table public.friendships            enable row level security;
alter table public.collection_collaborators enable row level security;
alter table public.collaborate_requests   enable row level security;
alter table public.collection_invite_links enable row level security;
alter table public.notifications          enable row level security;
alter table public.reports                enable row level security;
alter table public.blocks                 enable row level security;

-- NOTE: These are initial conservative owner-centric policies.
-- Later migrations will refine them using helper functions.

-- profiles: user can fully manage their own row
create policy profiles_self_access on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- saves: owner full access
create policy saves_owner_access on public.saves
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- collections: owner full access
create policy collections_owner_access on public.collections
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- collection_memberships: owner of collection or save owner will be refined later;
-- for now, only collection owner can manage memberships.
create policy collection_memberships_owner_access on public.collection_memberships
  for all
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id
        and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id
        and c.owner_id = auth.uid()
    )
  );

-- friend_requests: sender or receiver can see their rows
create policy friend_requests_sender_receiver_select on public.friend_requests
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy friend_requests_sender_modify on public.friend_requests
  for all
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

-- friendships: participants can see their friendships (no direct inserts from client)
create policy friendships_participant_select on public.friendships
  for select using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- collection_collaborators: owner manages; collaborator can see own row
create policy collection_collaborators_owner_manage on public.collection_collaborators
  for all
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id
        and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id
        and c.owner_id = auth.uid()
    )
  );

create policy collection_collaborators_self_select on public.collection_collaborators
  for select using (auth.uid() = user_id);

-- collaborate_requests: requester manages their own; owner can view
create policy collaborate_requests_requester_manage on public.collaborate_requests
  for all
  using (auth.uid() = requester_id)
  with check (auth.uid() = requester_id);

create policy collaborate_requests_owner_select on public.collaborate_requests
  for select using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id
        and c.owner_id = auth.uid()
    )
  );

-- collection_invite_links: creator manages their own
create policy collection_invite_links_creator_manage on public.collection_invite_links
  for all
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- notifications: recipient manage their notifications
create policy notifications_owner_manage on public.notifications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- reports: reporter manage their own (admins via service_role bypass RLS)
create policy reports_reporter_manage on public.reports
  for all
  using (auth.uid() = reporter_id)
  with check (auth.uid() = reporter_id);

-- blocks: blocker manage their blocks
create policy blocks_blocker_manage on public.blocks
  for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

