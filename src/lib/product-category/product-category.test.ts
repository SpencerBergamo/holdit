import { parseProductCategory, productCategorySchema } from '@/lib/product-category';

describe('productCategorySchema', () => {
  it('accepts a category whose path[0] is a Google top-level name', () => {
    const result = productCategorySchema.safeParse({
      taxonomy: 'google_product',
      path: ['Electronics', 'Audio', 'Headphones'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects when path[0] is not a valid Google top-level category', () => {
    const result = productCategorySchema.safeParse({
      taxonomy: 'google_product',
      path: ['Invalid Root', 'Something'],
    });
    expect(result.success).toBe(false);
  });
});

describe('parseProductCategory', () => {
  it('returns null when taxonomy or path shape is wrong', () => {
    expect(parseProductCategory(null)).toBeNull();
    expect(parseProductCategory({ taxonomy: 'other', path: ['Electronics'] })).toBeNull();
  });

  it('returns null when path[0] is not a Google top-level name', () => {
    expect(
      parseProductCategory({
        taxonomy: 'google_product',
        path: ['Electronics '],
      }),
    ).toBeNull();
  });
});
