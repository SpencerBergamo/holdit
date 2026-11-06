import { z } from 'zod';

import {
  GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL,
  type ProductCategory,
} from '@/types/product-category';

import { isGoogleProductTaxonomyTopLevel } from '@/lib/product-category/google-top-level';

export const productCategorySchema = z
  .object({
    taxonomy: z.literal('google_product'),
    path: z.array(z.string().min(1)).min(1).max(7),
  })
  .refine(
    (data) => isGoogleProductTaxonomyTopLevel(data.path[0]!),
    {
      message:
        'path[0] must exactly match a Google Product Taxonomy top-level category (see issue #2)',
      path: ['path', 0],
    },
  );

export function parseProductCategory(value: unknown): ProductCategory | null {
  const parsed = productCategorySchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function formatProductCategoryPath(path: string[]): string {
  return path.join(' > ');
}

/** Rules appended to Gemini product-extraction system instructions. */
export function buildProductCategoryExtractionRules(): string {
  const topLevelList = GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL.map(
    (name) => `- ${name}`,
  ).join('\n');

  return `- Every valid product (is_valid_product true) must include category with taxonomy google_product and a non-empty path.
- category.path is a Google Product Taxonomy breadcrumb from broadest to most specific (1–7 segments). path[0] must exactly match one of these top-level categories (character-for-character—keep "&" and punctuation as shown):
${topLevelList}
- For every valid product you must always set category—never omit it. Prefer deeper paths when you can justify them from the capture (photo, URL, or text); use one segment only ([path[0]] alone) only when unsure what sub-type applies.
- Add deeper segments when you can infer them (e.g. Electronics > Audio > Headphones, Apparel & Accessories > Clothing > Dresses). Use official Google segment spelling and " > " hierarchy semantics via separate path array elements—not a single joined string.
- When is_valid_product is false, set category to null.`;
}

export const productCategoryJsonSchemaProperty = {
  category: {
    type: 'object',
    nullable: true,
    additionalProperties: false,
    required: ['taxonomy', 'path'],
    description:
      'Google Product Taxonomy category for the item; required when is_valid_product is true. path[0] must be one of the official 21 top-level names (exact spelling).',
    properties: {
      taxonomy: {
        type: 'string',
        enum: ['google_product'],
      },
      path: {
        type: 'array',
        minItems: 1,
        maxItems: 7,
        prefixItems: [
          {
            type: 'string',
            enum: [...GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL],
          },
        ],
        items: {
          type: 'string',
          minLength: 1,
        },
        description:
          'First segment must be a Google top-level category; optional segments are increasingly specific types.',
      },
    },
  },
} as const;
