/**
 * `saves` row and embedded JSON shapes (ADR 0001, ADR 0002).
 * Product data lives on the Save row—not a shared catalog. Gift claim and purchase
 * state live on `collection_memberships`, not here.
 *
 * @see docs/adr/0001-per-save-product-snapshots.md
 * @see docs/adr/0002-collections-storage-in-supabase.md
 */

/** How the user started this Save (one-time input for product resolution). */
export type CaptureSourceType = 'url' | 'photo' | 'manual';

export type Capture = {
  source_type: CaptureSourceType;
  /** Normalized product page URL when `source_type` is `url`. */
  url: string | null;
  /** Storage path or URL for an uploaded capture photo. */
  photo_path: string | null;
  /** Freeform capture text when `source_type` is `manual`. */
  manual_text: string | null;
};

/** Merchant link surfaced on the Save (primary listing plus alternates). */
export type ProductLink = {
  url: string;
  label: string | null;
};

/**
 * Product data fixed on this Save after resolution completes (ADR 0001).
 * While resolution is pending or failed, may hold placeholder images/title from capture.
 */
export type ProductSnapshot = {
  title: string | null;
  images: string[];
  primary_url: string | null;
  merchant_links: ProductLink[];
  specs: Record<string, string>;
};

/** Structured variant choices; user edits win over AI pre-fill (CONTEXT.md). */
export type VariantDetails = {
  size: string | null;
  color: string | null;
  quantity: number | null;
};

export type SaveResolutionStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'unsupported';

export type Save = {
  id: string;
  owner_id: string;
  notes: string | null;
  capture: Capture;
  product_snapshot: ProductSnapshot;
  variant_details: VariantDetails;
  resolution_status: SaveResolutionStatus;
  created_at: string;
  updated_at: string;
};

/** Initial row from a capture; server/worker sets snapshot and advances resolution. */
export type SaveInsert = {
  owner_id: string;
  capture: Capture;
  notes?: string | null;
  variant_details?: VariantDetails;
};

/**
 * User-editable Save fields. Snapshot is not refreshed after resolution (ADR 0001).
 * `resolution_status` is updated by resolution jobs/RPC only.
 */
export type SaveUpdate = Partial<Pick<Save, 'notes' | 'variant_details'>>;
