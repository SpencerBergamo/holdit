import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  type Content,
  type FunctionDeclaration,
  type Part,
} from '@google/genai';

export const GEMINI_PRODUCT_MODEL = 'gemini-2.0-flash';
export const EXTRACT_PRODUCT_FUNCTION_NAME = 'extract_product_details';

const PRODUCT_EXTRACTION_SYSTEM_INSTRUCTION = `You are HoldIt's product extraction assistant.

The user is saving something they want to buy to a personal wishlist. From their capture (product photo, merchant URL, or manual text), extract structured product details by calling extract_product_details exactly once.

Rules:
- is_valid_product must be false for non-product URLs (homepages, blogs, search results, category pages, cart/checkout pages without a single product).
- For valid product captures, fill title and any variant hints (size, color, quantity) you can infer.
- images should list direct image URLs when known (from URL context); leave empty for photo-only captures.
- primary_url is the main merchant listing URL when known.
- merchant_links lists alternate purchase links with optional retailer labels.
- specs holds structured attributes (brand, material, model number, etc.) as string key-value pairs.
- rejection_reason is required when is_valid_product is false; otherwise null.
- Prefer null over guessing when a field is unknown.`;

export type ExtractProductInput =
  | { source_type: 'url'; url: string; notes?: string | null }
  | {
      source_type: 'photo';
      photo_base64: string;
      mime_type: string;
      notes?: string | null;
    }
  | { source_type: 'manual'; manual_text: string; notes?: string | null };

export type ProductExtractionResult = {
  is_valid_product: boolean;
  rejection_reason: string | null;
  product_snapshot: {
    title: string | null;
    images: string[];
    primary_url: string | null;
    merchant_links: { url: string; label: string | null }[];
    specs: Record<string, string>;
  };
  variant_details: {
    size: string | null;
    color: string | null;
    quantity: number | null;
  };
};

const extractProductFunctionDeclaration: FunctionDeclaration = {
  name: EXTRACT_PRODUCT_FUNCTION_NAME,
  description:
    'Return structured product details extracted from the user capture for a wishlist Save.',
  parametersJsonSchema: {
    type: 'object',
    additionalProperties: false,
    required: ['is_valid_product'],
    properties: {
      is_valid_product: { type: 'boolean' },
      rejection_reason: { type: 'string', nullable: true },
      title: { type: 'string', nullable: true },
      images: { type: 'array', items: { type: 'string' } },
      primary_url: { type: 'string', nullable: true },
      merchant_links: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['url'],
          properties: {
            url: { type: 'string' },
            label: { type: 'string', nullable: true },
          },
        },
      },
      specs: {
        type: 'object',
        additionalProperties: { type: 'string' },
      },
      size: { type: 'string', nullable: true },
      color: { type: 'string', nullable: true },
      quantity: { type: 'integer', nullable: true, minimum: 1 },
    },
  },
};

function appendNotes(base: string, notes?: string | null): string {
  const trimmedNotes = notes?.trim();
  if (!trimmedNotes) {
    return base;
  }
  return `${base}\n\nAdditional user notes: ${trimmedNotes}`;
}

function buildUserPrompt(input: ExtractProductInput): string {
  switch (input.source_type) {
    case 'url':
      return appendNotes(
        `Extract product details from this merchant URL:\n${input.url}`,
        input.notes,
      );
    case 'manual':
      return appendNotes(
        `Extract product details from this manual description:\n${input.manual_text}`,
        input.notes,
      );
    case 'photo':
      return appendNotes(
        'Extract product details from the attached product photo.',
        input.notes,
      );
  }
}

function buildExtractionContents(input: ExtractProductInput): Content[] {
  const parts: Part[] = [{ text: buildUserPrompt(input) }];

  if (input.source_type === 'photo') {
    parts.push({
      inlineData: {
        mimeType: input.mime_type,
        data: input.photo_base64,
      },
    });
  }

  return [{ role: 'user', parts }];
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function parseExtractProductFunctionCall(args: unknown): ProductExtractionResult {
  if (!args || typeof args !== 'object') {
    throw new Error('Invalid extract_product_details arguments.');
  }

  const record = args as Record<string, unknown>;

  if (typeof record.is_valid_product !== 'boolean') {
    throw new Error('extract_product_details missing is_valid_product.');
  }

  const merchantLinks = Array.isArray(record.merchant_links)
    ? record.merchant_links
        .filter(
          (link): link is Record<string, unknown> =>
            !!link && typeof link === 'object' && typeof link.url === 'string',
        )
        .map((link) => ({
          url: link.url as string,
          label: asNullableString(link.label),
        }))
    : [];

  const specs =
    record.specs && typeof record.specs === 'object' && !Array.isArray(record.specs)
      ? Object.fromEntries(
          Object.entries(record.specs).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
          ),
        )
      : {};

  return {
    is_valid_product: record.is_valid_product,
    rejection_reason: asNullableString(record.rejection_reason),
    product_snapshot: {
      title: asNullableString(record.title),
      images: Array.isArray(record.images)
        ? record.images.filter((image): image is string => typeof image === 'string')
        : [],
      primary_url: asNullableString(record.primary_url),
      merchant_links: merchantLinks,
      specs,
    },
    variant_details: {
      size: asNullableString(record.size),
      color: asNullableString(record.color),
      quantity:
        typeof record.quantity === 'number' && Number.isInteger(record.quantity)
          ? record.quantity
          : null,
    },
  };
}

export async function extractProductFromCapture(
  input: ExtractProductInput,
): Promise<ProductExtractionResult> {
  const apiKey = Deno.env.get('GEMINI_API_KEY') ?? Deno.env.get('GOOGLE_API_KEY');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model: GEMINI_PRODUCT_MODEL,
    contents: buildExtractionContents(input),
    config: {
      systemInstruction: PRODUCT_EXTRACTION_SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: [extractProductFunctionDeclaration] }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: [EXTRACT_PRODUCT_FUNCTION_NAME],
        },
      },
    },
  });

  const functionCall = response.functionCalls?.[0];

  if (!functionCall || functionCall.name !== EXTRACT_PRODUCT_FUNCTION_NAME) {
    throw new Error('Gemini did not return an extract_product_details function call.');
  }

  return parseExtractProductFunctionCall(functionCall.args);
}

export function isExtractProductInput(value: unknown): value is ExtractProductInput {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  switch (record.source_type) {
    case 'url':
      return typeof record.url === 'string' && record.url.trim().length > 0;
    case 'manual':
      return (
        typeof record.manual_text === 'string' && record.manual_text.trim().length > 0
      );
    case 'photo':
      return (
        typeof record.photo_base64 === 'string' &&
        record.photo_base64.length > 0 &&
        typeof record.mime_type === 'string' &&
        record.mime_type.trim().length > 0
      );
    default:
      return false;
  }
}
