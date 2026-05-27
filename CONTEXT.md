# HoldIt

HoldIt helps people save things they want to buy later, organized into lists they can share with friends for gift ideas.

## Language

**Save**:
The primary thing a user creates when they want something. Each Save triggers its own AI and web-crawl run from the user's capture—HoldIt does not deduplicate crawls or product rows across Saves or users. A Save owns its product snapshot (title, images, merchant links, specs), structured variant details (e.g. size, color, quantity), optional freeform notes for everything else (e.g. retailer preference), and collection memberships. The same person may create multiple Saves from the same merchant link when variant details differ. The Save always belongs to the user who created it—even when it appears on someone else's collection through collaborative sharing. Saving starts with a capture and per-Save resolution; assigning collection(s) is optional at first. Friends with access to a collection see the Save's snapshot, variant details, and notes there.
_Avoid_: Shared product catalog; one Save per merchant listing; skipping AI/crawl because a URL was saved before; warning or blocking duplicate Saves for the same listing; Item (as the domain entity name)

**Product snapshot**:
Merchant-sourced product data stored on a single Save after resolution—title, images, links, specs. A snapshot at that Save's resolution time; fixed once resolution completes. HoldIt does not re-crawl or refresh an existing Save—merchant changes or a better URL require creating a new Save.
_Avoid_: Merchant product (as a shared entity); catalog; deduplication; manual or automatic re-crawl on an existing Save

**Variant details**:
Per-Save attributes such as size, color, and quantity—extracted from the capture by AI/crawler or entered by the user. What distinguishes two Saves that point at the same merchant listing. AI may pre-fill values; the user's edits always win.
_Avoid_: Storing variants only in freeform notes when structured fields exist; assuming one Save per SKU; AI overwriting user-edited variant fields

**Notes**:
Freeform text on a Save for preferences that are not variant details—e.g. preferred retailer, gift wrap, timing. Separate from structured variant details. Friends with collection access can see notes on Saves shown there.
_Avoid_: Putting size, color, or quantity only in notes when variant fields exist; merging notes into the product snapshot

**User-supplied save**:
A Save whose product snapshot is not yet from a merchant listing—resolution in progress, resolution failed, unsupported merchant, or manual entry. The user's uploaded photo or capture preview is the placeholder image; the user may be prompted for manual product details when the crawler cannot handle a site. When that Save's initial resolution succeeds, its product snapshot becomes merchant-sourced in place. After resolution completes, the snapshot is not updated again—a new URL or better match means a new Save.
_Avoid_: Blocking Save creation until resolution succeeds; re-crawling a completed Save because the user added a link later

**Product resolution**:
AI and web-crawl work for one Save from its capture. Runs for every new Save. While resolution runs, the user still has a user-supplied save and can assign collections; the card upgrades when resolution completes. URL captures that are clearly not product pages are rejected before a Save is created. Unsupported merchant sites follow the user-supplied path with a manual-details prompt—not early rejection.
_Avoid_: Reusing another Save's crawl result; spinner-only flows that delay Save creation; creating Saves from homepages, articles, or other non-product URLs

**Collection**:
A named list a user creates to organize Saves—e.g. "Birthday", "Kitchen", or "Wishlist". Collections are the only list type; "wishlist" is casual language or a collection name, not a separate entity. Registered users may create unlimited collections. Anonymous users may have at most one collection. Collections are private by default—only the owner sees them until shared. The collection owner can share a collection with friends as read-only or collaborative. Deleting a collection deletes Saves that exist only on that collection. If a Save is on other collections too, only the membership for the deleted collection is removed—the Save remains elsewhere. A collaborator's Save is never deleted from their account—only the membership on the deleted collection is removed.
_Avoid_: Wishlist (as a domain type distinct from Collection); public-by-default lists; all friends automatically seeing every collection

**Collection share**:
Access a collection owner grants a friend. The owner chooses read-only or collaborative each time they share—there is no default permission. **Read-only** share: the friend can view Saves on that collection but cannot add or remove them. **Collaborative** share: the friend can add their own Saves to that collection and can remove or edit only Saves they own on that collection—not the owner's Saves. The collection owner can remove any Save from their collection. When share is revoked or friendship ends, a collaborator's Saves stay on the collection; they lose edit/remove access there.
_Avoid_: Assuming all shares work the same way; "shared" without a permission level; collaborators editing the owner's Saves

**Inbox**:
Saves that have no collection membership yet—the user's unsorted wants. Strictly private: only the owner sees Inbox; friends never see unsorted Saves. New Saves can land here without picking a collection; the user can organize later or create a new collection during the same flow. Sharing applies only when a Save is on a shared collection. Anonymous users may use Inbox; their ten-Save limit applies across Inbox and collections combined.
_Avoid_: Forcing a default collection at signup; public or friend-visible inbox

**Collection membership**:
The link between a Save and a Collection. A Save can have many memberships without creating another Save or re-running resolution. Within a collection, Saves are shown newest-first by default; the collection owner can manually reorder.
_Avoid_: Creating a new Save when adding the same want to another collection

**Gift claim**:
A friend's indication on a shared collection that they intend to buy a Save for the collection owner. Any friend with read-only or collaborative access can claim any Save on that collection except Saves they own themselves. The first claim on a Save wins—other viewers see it as already claimed and cannot claim it again. Claims are visible to other viewers; the collection owner does not see which Save was claimed or by whom.
_Avoid_: Multiple friends claiming the same Save; restricting claims to only the collection owner's Saves

**Purchase**:
Marking that a Save has been bought. On a shared collection, any friend with access can mark purchased on any Save; the collection owner sees purchased state on those Saves. When the collection owner marks purchased on their own Save (bought it themselves), that Save is removed from their collections. Distinct from a gift claim, which is intent to buy for someone else.
_Avoid_: Using "purchase" for gift claim intent alone

**Notification** (v1):
An alert about gift or social activity. v1 includes: friend request received (notify the recipient), friend request accepted (notify the requester only), a collection shared with you, invite link accepted (notify the collection owner), and owner gift activity notices. Does not include save-resolution status, marketing, gift reminders, or broad friend-activity digests. Every notification appears in-app with read and unread state; opening or tapping a notification marks it read. Push delivery respects a single master preference—when push is off, no v1 notification types are sent as push; they remain in-app only.
_Avoid_: Notifying on every gift claim; treating notifications as a generic activity feed; email as a required channel in v1; notifying the accepter when they accepted a request; per-category push toggles in v1; push without an in-app record

**Owner gift activity notice**:
A collection-level, non-spoiling notification to the collection owner when duplicate gift risk is detected on a shared collection—e.g. a second friend tries to claim an already-claimed Save, or two friends mark the same Save as purchased. It does not name the Save or the friend. Example tone: "More than one shopper from your Birthday collection purchased the same item."
_Avoid_: Revealing product names or gifters before the gift is given

**Capture**:
The photo, URL, or manual text a user provides when creating a Save. Used for that Save's one-time product resolution. After resolution completes, the capture is retained for provenance but is not the primary image on the collection—the product snapshot is.
_Avoid_: Discarding the capture after success; limiting manual entry to failure flows only

**User**:
Someone using HoldIt with a registered account. Required for friendship, collection sharing, and full social features. Registered users have no cap on Saves or collections.
_Avoid_: Account (unless speaking about sign-up mechanics outside the domain)

**Profile**:
How a registered user presents themselves in HoldIt. HoldIt does not use usernames—display name is the public-facing identifier and need not be unique; friends disambiguate people by avatar and phone number (e.g. via contact matching). Profile data is highly private: only friends see the full profile (display name, avatar, and optional birthday as month and day only, no year, when provided, for gift context). Email, member-since, and other account details are not shown to others in v1.
_Avoid_: Public profiles; exposing email on the profile; usernames or handles; requiring globally unique display names; requiring birthday to use the app

**Profile preview**:
The limited view a non-friend may see only while a friendship invite is in flight—display name and avatar only. No birthday or other fields until friendship is mutual. Outside an active invite, non-friends cannot view profile data.
_Avoid_: Browsing profiles without an invite; treating profile preview as a public profile; usernames

**Anonymous user**:
Someone using HoldIt without a registered account. Same capture and per-Save resolution flows as a registered user, but limited to one collection and at most ten Saves. Adding an eleventh Save is blocked until they register. Cannot friend or receive collection shares until they register. On sign-up, all anonymous Saves and their collection migrate to the registered account.
_Avoid_: Guest (unless used consistently in UI copy); discarding anonymous data at registration

**Friendship**:
A mutual connection between two registered users. Only friends can receive collection shares. Users find friends via contact/phone matching (with consent) or invite links. A friend request alone does not grant collection access—the owner shares a collection separately, except when friendship is created through an invite link that encodes a collection share. Accepting a friend invite link creates mutual friendship immediately and grants that encoded share.
_Avoid_: Follow (one-way); sharing collections with non-friends; automatic access to all collections on new friendship

**Report**:
A registered user's flag that another user or a Save on a shared collection violates HoldIt's rules (e.g. harassment, spam, inappropriate content in snapshot, image, or notes). v1 supports reporting users and Saves—not whole collections as a separate report type. Submitting a report queues it for moderation; the reporter may block the user in the same flow. The reporter is notified in-app only when moderation takes action—not when a report is dismissed without action.
_Avoid_: Reporting collections as a first-class type in v1; anonymous users submitting reports; auto-hiding content for all users without review; notifying on every report outcome

**Block**:
A registered user preventing another user from interacting with them. Blocking is immediate and silent—the blocked user is not notified. Mutual friendship ends, all collection shares between the two users are revoked in both directions, and no new friend requests or shares are possible while the block stands. If the blocked user tries to interact, they see a clear failure message without necessarily being told they are blocked. Collaborator Saves that remain on a collection after access ends follow the collection-share rules. Distinct from a report.
_Avoid_: Using block and report as the same action without a report option; leaving collection shares active after a block; notifying the blocked user

**Invite link**:
A link the collection owner generates to add a friend and share a specific collection in one step. Carries the target collection and share permission. The owner can see who accepted the link and revoke an individual's collection share. Accepting creates mutual friendship if needed and applies that collection share. If the users are already friends, only the collection share is applied or updated—no duplicate friendship. A user who is not registered must sign up (or complete registration) before the link applies; any anonymous Saves migrate on sign-up, then friendship and share are created. Invite links do not expire by time—the owner revokes them when they should stop working. The same link may be accepted by multiple people; each acceptance creates mutual friendship and the encoded collection share for that person. Revoking an invite link prevents new acceptances only—people who already accepted keep friendship and collection share until the owner revokes share or blocks them.
_Avoid_: Separate friend-add and collection-share flows when the intent is "join and see this list"; automatic expiry without owner action; single-use invite links; revoking a link removing access from everyone who already joined; failing when the invitee is already a friend; granting collection access to anonymous users without registration
