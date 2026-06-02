import { File } from 'expo-file-system';

import type {
  ExtractProductInput,
  ProductExtractionResult,
  ResolveProductCaptureInput,
} from '@/types/product-extraction';
import { supabase } from '@/utils/supabase';

function inferMimeType(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

async function toExtractProductInput(
  input: ResolveProductCaptureInput,
): Promise<ExtractProductInput> {
  if (input.source_type === 'photo') {
    const file = new File(input.photo_uri);
    const photo_base64 = await file.base64();

    return {
      source_type: 'photo',
      photo_base64,
      mime_type: inferMimeType(input.photo_uri),
      notes: input.notes,
    };
  }

  return input;
}

export class ResolveProductError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = 'ResolveProductError';
    this.status = status;
  }
}

/**
 * Calls the Supabase Edge Function that runs Gemini product extraction.
 * Requires a signed-in user so the function can verify auth and keep GEMINI_API_KEY server-side.
 */
export async function resolveProductFromCapture(
  input: ResolveProductCaptureInput,
): Promise<ProductExtractionResult> {
  const payload = await toExtractProductInput(input);

  const { data, error } = await supabase.functions.invoke('resolve-product', {
    body: payload,
  });

  if (error) {
    throw new ResolveProductError(error.message, 502);
  }

  const result = data as ProductExtractionResult | { error?: string };

  if (result && typeof result === 'object' && 'error' in result && result.error) {
    throw new ResolveProductError(result.error, 502);
  }

  return result as ProductExtractionResult;
}

export { toExtractProductInput, inferMimeType };
