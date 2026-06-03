import type { Capture, ProductSnapshot, Save } from '@/types/save';
import { supabase } from '@/utils/supabase';

const EMPTY_SNAPSHOT: ProductSnapshot = {
  title: null,
  images: [],
  primary_url: null,
  merchant_links: [],
  specs: {},
  price_cents: null,
  currency: null,
};

function parseProductSnapshot(value: unknown): ProductSnapshot {
  if (!value || typeof value !== 'object') {
    return EMPTY_SNAPSHOT;
  }

  const raw = value as Record<string, unknown>;
  const images = Array.isArray(raw.images)
    ? raw.images.filter((item): item is string => typeof item === 'string')
    : [];

  const merchant_links = Array.isArray(raw.merchant_links)
    ? raw.merchant_links
        .filter((item): item is { url: string; label: string | null } => {
          if (!item || typeof item !== 'object') {
            return false;
          }
          const link = item as Record<string, unknown>;
          return typeof link.url === 'string';
        })
        .map((item) => ({
          url: item.url,
          label:
            typeof item.label === 'string'
              ? item.label
              : item.label === null
                ? null
                : null,
        }))
    : [];

  const specs =
    raw.specs && typeof raw.specs === 'object' && !Array.isArray(raw.specs)
      ? Object.fromEntries(
          Object.entries(raw.specs as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
          ),
        )
      : {};

  return {
    title: typeof raw.title === 'string' ? raw.title : null,
    images,
    primary_url: typeof raw.primary_url === 'string' ? raw.primary_url : null,
    merchant_links,
    specs,
    price_cents:
      typeof raw.price_cents === 'number' && Number.isFinite(raw.price_cents)
        ? raw.price_cents
        : null,
    currency: typeof raw.currency === 'string' ? raw.currency : null,
  };
}

function parseCapture(value: unknown): Capture {
  if (!value || typeof value !== 'object') {
    return {
      source_type: 'manual',
      url: null,
      photo_path: null,
      manual_text: null,
    };
  }

  const raw = value as Record<string, unknown>;
  const source_type =
    raw.source_type === 'url' ||
    raw.source_type === 'photo' ||
    raw.source_type === 'manual'
      ? raw.source_type
      : 'manual';

  return {
    source_type,
    url: typeof raw.url === 'string' ? raw.url : null,
    photo_path: typeof raw.photo_path === 'string' ? raw.photo_path : null,
    manual_text:
      typeof raw.manual_text === 'string' ? raw.manual_text : null,
  };
}

type SaveRow = {
  id: string;
  owner_id: string;
  product_snapshot: unknown;
  variant_details: unknown;
  notes: string | null;
  capture_data: unknown;
  created_at: string;
  updated_at: string;
};

type MembershipRow = {
  sort_position: number | null;
  saves: SaveRow | SaveRow[] | null;
};

function mapSaveRow(row: SaveRow): Save {
  return {
    id: row.id,
    owner_id: row.owner_id,
    notes: row.notes,
    capture: parseCapture(row.capture_data),
    product_snapshot: parseProductSnapshot(row.product_snapshot),
    variant_details: {
      size: null,
      color: null,
      quantity: null,
    },
    resolution_status: 'succeeded',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Loads saves for a collection, ordered by membership sort position.
 */
export async function fetchCollectionSaves(collectionId: string): Promise<Save[]> {
  const { data, error } = await supabase
    .from('collection_memberships')
    .select(
      `
      sort_position,
      saves (
        id,
        owner_id,
        product_snapshot,
        variant_details,
        notes,
        capture_data,
        created_at,
        updated_at
      )
    `,
    )
    .eq('collection_id', collectionId)
    .order('sort_position', { ascending: true, nullsFirst: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as MembershipRow[];

  return rows
    .map((row) => {
      const save = row.saves;
      if (!save) {
        return null;
      }
      const saveRow = Array.isArray(save) ? save[0] : save;
      return saveRow ? mapSaveRow(saveRow) : null;
    })
    .filter((save): save is Save => save !== null);
}
