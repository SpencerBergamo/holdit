import {
  EXTRACT_PRODUCT_FUNCTION_NAME,
  GEMINI_PRODUCT_MODEL,
} from '@/lib/gemini/constants';
import { buildExtractionContents } from '@/lib/gemini/build-extraction-content';
import {
  extractProductFunctionDeclaration,
  mapExtractProductArgsToResult,
  parseExtractProductFunctionCall,
} from '@/lib/gemini/extract-product-tool';

describe('extract-product-tool', () => {
  it('declares the extract_product_details function', () => {
    expect(extractProductFunctionDeclaration.name).toBe(
      EXTRACT_PRODUCT_FUNCTION_NAME,
    );
    expect(extractProductFunctionDeclaration.parametersJsonSchema).toMatchObject({
      type: 'object',
      required: ['is_valid_product'],
    });
  });

  it('parses a valid function call into domain types', () => {
    const result = parseExtractProductFunctionCall({
      is_valid_product: true,
      rejection_reason: null,
      title: 'Ceramic Pour-Over Kettle',
      images: ['https://cdn.example/kettle.jpg'],
      primary_url: 'https://shop.example/kettle',
      merchant_links: [{ url: 'https://shop.example/kettle', label: 'Example Shop' }],
      specs: { brand: 'Hario', material: 'Stainless steel' },
      size: '600ml',
      color: 'Matte black',
      quantity: 1,
    });

    expect(result).toEqual({
      is_valid_product: true,
      rejection_reason: null,
      product_snapshot: {
        title: 'Ceramic Pour-Over Kettle',
        images: ['https://cdn.example/kettle.jpg'],
        primary_url: 'https://shop.example/kettle',
        merchant_links: [
          { url: 'https://shop.example/kettle', label: 'Example Shop' },
        ],
        specs: { brand: 'Hario', material: 'Stainless steel' },
      },
      variant_details: {
        size: '600ml',
        color: 'Matte black',
        quantity: 1,
      },
    });
  });

  it('maps invalid URL captures with a rejection reason', () => {
    const result = mapExtractProductArgsToResult({
      is_valid_product: false,
      rejection_reason: 'This looks like a homepage, not a product page.',
      title: null,
      images: [],
      primary_url: null,
      merchant_links: [],
      specs: {},
      size: null,
      color: null,
      quantity: null,
    });

    expect(result.is_valid_product).toBe(false);
    expect(result.rejection_reason).toContain('homepage');
  });
});

describe('buildExtractionContents', () => {
  it('builds URL capture prompts with optional notes', () => {
    const contents = buildExtractionContents({
      source_type: 'url',
      url: 'https://shop.example/item',
      notes: 'Prefer the blue one',
    });

    expect(contents[0]?.parts?.[0]).toEqual({
      text: expect.stringContaining('https://shop.example/item'),
    });
    expect(contents[0]?.parts?.[0]).toEqual({
      text: expect.stringContaining('Prefer the blue one'),
    });
  });

  it('includes inline photo data for photo captures', () => {
    const contents = buildExtractionContents({
      source_type: 'photo',
      photo_base64: 'abc123',
      mime_type: 'image/jpeg',
    });

    expect(contents[0]?.parts).toEqual([
      { text: expect.stringContaining('attached product photo') },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: 'abc123',
        },
      },
    ]);
  });

  it('uses the flash model constant for server calls', () => {
    expect(GEMINI_PRODUCT_MODEL).toBe('gemini-2.0-flash');
  });
});
