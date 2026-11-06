import { GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL } from '@/types/product-category';

/** Set for validating path[0] against Google's 21 root category names. */
export const GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL_SET = new Set<string>(
  GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL,
);

export function isGoogleProductTaxonomyTopLevel(segment: string): boolean {
  return GOOGLE_PRODUCT_TAXONOMY_TOP_LEVEL_SET.has(segment);
}
