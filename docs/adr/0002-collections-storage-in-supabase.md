---
status: accepted
---

# Collections storage in Supabase (Postgres + RLS)

HoldIt stores **collections**, **collection memberships**, friend visibility, collaboration, and gift actions in **Supabase Postgres**, with **Row Level Security** on the client path. Domain rules live in `CONTEXT.md` (**Collection**, **Friend-visible collection**, **Collection collaboration**, **Inbox**, **Collection membership**). This ADR records storage shape and access enforcement—not UI or Convex-era patterns.

## Decisions

### Inbox is derived, not a table

**Inbox** is saves owned by the user with **no** `collection_memberships` row. There is no inbox collection and no `inbox` table.

### `collections` row shape

| Column | Purpose |
|--------|---------|
| `id` | `uuid` PK |
| `owner_id` | `auth.users` FK |
| `name` | Required; emoji allowed (Unicode text) |
| `description` | Optional; owner-only in product (RLS/API) |
| `visible_to_friends` | Boolean, default **false** |
| `created_at` / `updated_at` | Timestamps |

Friend-visible means mutual friends may **view** via the owner's profile—not world-readable links. v1 has no internet-public collections.

### Sort order on memberships

Manual order is stored on **`collection_memberships.sort_position`** (`int`, nullable). Non-null positions sort ascending first; `NULL` positions sort by save-added recency (newest-first). Order is **per membership** (same Save can rank differently on two collections).

### Access: view vs collaborate

| Capability | Mechanism |
|------------|-----------|
| **View** (read Saves on a list) | `visible_to_friends = true` **and** mutual **friendship** |
| **Collaborate** (add own Saves, edit/remove own Saves on that list) | Row in **`collection_collaborators`**, or approved **`collaborate_requests`**, or **invite link** acceptance |
| **Discovery** | Friend-visible collections listed on the **owner's profile** only (no v1 home feed of all friends' lists) |

Read access does **not** require an invite. **Invite links** grant **collection collaboration** (and create **friendship** if needed)—not view-by-themselves. Owner may grant collaboration directly without a request.

### Core tables

```
collections
collection_memberships   -- save_id, collection_id, sort_position, claim/purchase fields
collection_collaborators -- (collection_id, user_id), granted_via, invite_link_id nullable
collaborate_requests     -- pending | approved | denied
collection_invite_links  -- token, collection_id, revoked_at nullable
friend_requests          -- pending | accepted | declined
friendships              -- (user_a_id, user_b_id) with user_a_id < user_b_id
```

**`collection_memberships`** also holds per-list gift state (v1):

- `claimed_by`, `claimed_at` — first claim wins; friends see; owner must not see claim identity (RLS/API).
- `purchased_by`, `purchased_at` — friends may mark; owner sees purchased state.

**`collection_invite_links`**: multi-use until `revoked_at` is set; revoking blocks new accepts only. Existing collaborators keep access until removed from `collection_collaborators`.

**`saves.owner_id`** is always the **creator** (owner or collaborator). Membership links a save to someone else's collection without transferring ownership.

### Collection delete

**Hard delete** the `collections` row. In a single transaction (Supabase RPC `delete_collection`):

1. Cascade/remove memberships, collaborators, requests, invite links for that collection.
2. Delete **orphan saves** that have zero memberships afterward—**only** saves owned by the collection owner (never delete a collaborator's save; drop their membership only).

No soft-delete in v1.

### Auth and anonymous users

Use **Supabase anonymous auth** (`signInAnonymously`) so pre-registration data uses a real `auth.users` id. Link/upgrade on sign-up keeps the same id. Enforce anonymous limits (one collection, ten saves) in app + DB constraints/RPC. Anonymous users cannot use `visible_to_friends` or social features.

### RLS

Use **private-schema SQL helpers** (`SECURITY DEFINER`, fixed `search_path`), e.g. `is_friend`, `can_view_collection`, `can_collaborate_on_collection`, referenced by thin policies on `collections`, `collection_memberships`, `saves`, and collaborator tables. Heavy or multi-step rules (`delete_collection`, accept invite, approve collaborate request) use **RPC** in transactions. Avoid duplicating friendship/visibility joins in every policy (inline-only policies rejected).

## Considered options

- **Inbox as system collection row** — rejected; contradicts glossary (**Inbox** is not a **Collection**).
- **`is_public` / link-only anonymous read** — rejected for v1; friends-only visibility with per-collection opt-in.
- **Per-friend read shares** — rejected; view is `visible_to_friends` + friendship; invites are for collaboration only.
- **Read-only collection share type** — superseded by friend-visible + collaboration split.
- **Gift claim / purchase on `saves`** — rejected; state is per **collection membership**.
- **Soft-delete collections** — rejected for v1.
- **Two-row friendship storage** — rejected; canonical `user_a_id < user_b_id` pair plus `friend_requests`.
- **RLS only in API/service role** — rejected; client uses Supabase with RLS.

## Consequences

- Client and RPC must implement delete orphan logic correctly; bugs could delete wrong saves or leave orphans.
- Friend-visible browse requires friendship queries on profile; index `(owner_id)` on `collections` where `visible_to_friends` and friendship indexes matter.
- Claim-hiding from owner is enforced in RLS or API views—not a separate table.
- Test data using `isPublic` on collections is obsolete; use `visible_to_friends` and friendship.
- Saves ADR (0001) unchanged: snapshots stay on **Save**; memberships only link and hold per-list social state.
- Implementation should align `CONTEXT.md` terms; do not reintroduce read-only **collection share** without revisiting this ADR.
