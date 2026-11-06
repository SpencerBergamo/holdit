/**
 * Commerce category on a Save's product snapshot (https://github.com/SpencerBergamo/holdit/issues/2).
 * Paths follow Google Product Taxonomy segment names, broadest → most specific.
 *
 * @see https://www.google.com/basepages/producttype/taxonomy.en-US.txt
 * @see docs/product-extraction.md
 */

export type ProductCategoryTaxonomy = 'google_product';

export type ProductCategory = {
  taxonomy: ProductCategoryTaxonomy;
  /** Google taxonomy breadcrumb, e.g. ["Electronics", "Audio", "Headphones"]. */
  path: string[];
};

/** Google Product Taxonomy v2021-09-21 top-level categories (21 roots). */
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

export type GoogleProductTaxonomyTopLevel =
  (typeof GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL)[number];
