import type { CaptureSourceType } from '@/types/save';
import type { ProductSnapshot, VariantDetails } from '@/types/save';

/** Server-side input for Gemini product extraction. */
export type ExtractProductInput =
  | {
      source_type: 'url';
      url: string;
      notes?: string | null;
    }
  | {
      source_type: 'photo';
      photo_base64: string;
      mime_type: string;
      notes?: string | null;
    }
  | {
      source_type: 'manual';
      manual_text: string;
      notes?: string | null;
    };

/** App-facing input before photo bytes are read. */
export type ResolveProductCaptureInput =
  | {
      source_type: Extract<'url', CaptureSourceType>;
      url: string;
      notes?: string | null;
    }
  | {
      source_type: Extract<'photo', CaptureSourceType>;
      photo_uri: string;
      notes?: string | null;
    }
  | {
      source_type: Extract<'manual', CaptureSourceType>;
      manual_text: string;
      notes?: string | null;
    };

/** Structured result from the Gemini `extract_product_details` tool call. */
export type ProductExtractionResult = {
  is_valid_product: boolean;
  rejection_reason: string | null;
  product_snapshot: ProductSnapshot;
  variant_details: VariantDetails;
};
