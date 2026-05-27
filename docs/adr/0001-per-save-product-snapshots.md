---
status: accepted
---

# Per-Save product snapshots instead of a shared catalog

HoldIt stores product data on each **Save**, not in a deduplicated shared merchant catalog. Every new Save runs AI and web-crawl for that capture. The resulting **product snapshot** (title, images, links, specs) and **variant details** (size, color, quantity) belong to that Save only. Snapshots are fixed when resolution completes; merchant changes or a better URL require a new Save.

We chose this over a shared catalog (one row per merchant listing, crawl once, many users/Saves point at it) because gift-list intent is per Save: the same Amazon link can mean different sizes, colors, or quantities, and friends need the owner's variant choices—not a generic listing. Deduping crawls saved infrastructure cost but forced variant data into notes or fought the "one Save per Product" rule.

**Considered options**

- **Shared merchant catalog** — dedupe by merchant + product ID (or normalized URL); reuse crawl results across users and Saves. Rejected: variants and per-save context don't map cleanly to a shared row; repointing Saves on upgrade added complexity.
- **Hybrid** — shared catalog for display, fresh crawl per Save for variants. Rejected: two sources of truth without clear ownership.

**Consequences**

- Higher AI/crawl cost and latency per Save; acceptable trade for correct per-save data.
- Duplicate Saves for the same URL are allowed (no warnings); users may create overlapping entries intentionally or by mistake.
- No automatic or manual refresh of an existing Save's snapshot; operational simplicity at the cost of stale merchant data until the user creates a new Save.
- Collection membership still links one Save to many collections without re-running resolution.
- Domain language lives in `CONTEXT.md` (**Save**, **product snapshot**, **variant details**); implementation should not reintroduce shared-product dedup "as an optimization" without revisiting this ADR.
