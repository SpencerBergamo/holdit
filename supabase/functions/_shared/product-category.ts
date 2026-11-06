/** Keep in sync with `src/types/product-category.ts` and `src/lib/product-category/index.ts`. @see https://github.com/SpencerBergamo/holdit/issues/2 */

export type ProductCategoryTaxonomy = 'google_product';

export type ProductCategory = {
  taxonomy: ProductCategoryTaxonomy;
  path: string[];
};

export const GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL = [
  'Animals & Pet Supplies',
  'Apparel & Accessories',
  'Arts & Entertainment',
  'Baby & Toddler',
  'Business & Industrial',
  'Cameras & Optics',
  'Electronics',
  'Food, Beverages & Tobacco',
  'Furniture',
  'Hardware',
  'Health & Beauty',
  'Home & Garden',
  'Luggage & Bags',
  'Mature',
  'Media',
  'Office Supplies',
  'Religious & Ceremonial',
  'Software',
  'Sporting Goods',
  'Toys & Games',
  'Vehicles & Parts',
] as const;

const GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL_SET = new Set<string>(
  GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL,
);

function isGoogleProductTaxonomyTopLevel(segment: string): boolean {
  return GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL_SET.has(segment);
}

export function parseProductCategory(value: unknown): ProductCategory | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (record.taxonomy !== 'google_product') {
    return null;
  }

  if (!Array.isArray(record.path) || record.path.length === 0 || record.path.length > 7) {
    return null;
  }

  if (!record.path.every((segment): segment is string => typeof segment === 'string' && segment.length > 0)) {
    return null;
  }

  if (!isGoogleProductTaxonomyTopLevel(record.path[0] as string)) {
    return null;
  }

  return {
    taxonomy: 'google_product',
    path: record.path,
  };
}

export function buildProductCategoryExtractionRules(): string {
  const topLevelList = GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL.map(
    (name) => `- ${name}`,
  ).join('\n');

  return `- Every valid product (is_valid_product true) must include category with taxonomy google_product and a non-empty path.
- category.path is a Google Product Taxonomy breadcrumb from broadest to most specific (1–7 segments). path[0] must exactly match one of these top-level categories (character-for-character—keep "&" and punctuation as shown):
${topLevelList}
- For every valid product you must always set category—never omit it. Prefer deeper paths when you can justify them from the capture (photo, URL, or text); use one segment only (path[0] alone) only when unsure what sub-type applies.
- Add deeper segments when you can infer them (e.g. Electronics > Audio > Headphones, Apparel & Accessories > Clothing > Dresses). Use official Google segment spelling and " > " hierarchy semantics via separate path array elements—not a single joined string.
- When is_valid_product is false, set category to null.`;
}
