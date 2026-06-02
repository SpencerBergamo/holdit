import type { FunctionDeclaration } from '@google/genai';
import { z } from 'zod';

import type { ProductExtractionResult } from '@/types/product-extraction';
import { EXTRACT_PRODUCT_FUNCTION_NAME } from '@/lib/gemini/constants';

const merchantLinkSchema = z.object({
  url: z.string(),
  label: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
});

export const extractProductArgsSchema = z.object({
  is_valid_product: z.boolean(),
  rejection_reason: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  title: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  images: z.array(z.string()).default([]),
  primary_url: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  merchant_links: z.array(merchantLinkSchema).default([]),
  specs: z.record(z.string(), z.string()).default({}),
  size: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  color: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  quantity: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
});

export type ExtractProductArgs = z.infer<typeof extractProductArgsSchema>;

export const extractProductFunctionDeclaration: FunctionDeclaration = {
  name: EXTRACT_PRODUCT_FUNCTION_NAME,
  description:
    'Return structured product details extracted from the user capture for a wishlist Save.',
  parametersJsonSchema: {
    type: 'object',
    additionalProperties: false,
    required: ['is_valid_product'],
    properties: {
      is_valid_product: {
        type: 'boolean',
        description:
          'False when the capture is clearly not a single product (e.g. homepage, article, search page).',
      },
      rejection_reason: {
        type: 'string',
        nullable: true,
        description:
          'Short user-facing reason when is_valid_product is false; otherwise null.',
      },
      title: {
        type: 'string',
        nullable: true,
        description: 'Product title or name.',
      },
      images: {
        type: 'array',
        items: { type: 'string' },
        description: 'Direct image URLs when known.',
      },
      primary_url: {
        type: 'string',
        nullable: true,
        description: 'Primary merchant product page URL.',
      },
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
        description: 'Alternate purchase links with optional retailer labels.',
      },
      specs: {
        type: 'object',
        additionalProperties: { type: 'string' },
        description: 'Structured product attributes such as brand or model.',
      },
      size: {
        type: 'string',
        nullable: true,
        description: 'Variant size when inferable from the capture.',
      },
      color: {
        type: 'string',
        nullable: true,
        description: 'Variant color when inferable from the capture.',
      },
      quantity: {
        type: 'integer',
        nullable: true,
        minimum: 1,
        description: 'Desired quantity when inferable from the capture.',
      },
    },
  },
};

export function mapExtractProductArgsToResult(
  args: ExtractProductArgs,
): ProductExtractionResult {
  return {
    is_valid_product: args.is_valid_product,
    rejection_reason: args.rejection_reason,
    product_snapshot: {
      title: args.title,
      images: args.images,
      primary_url: args.primary_url,
      merchant_links: args.merchant_links,
      specs: args.specs,
    },
    variant_details: {
      size: args.size,
      color: args.color,
      quantity: args.quantity,
    },
  };
}

export function parseExtractProductFunctionCall(
  args: unknown,
): ProductExtractionResult {
  const parsed = extractProductArgsSchema.parse(args);
  return mapExtractProductArgsToResult(parsed);
}
