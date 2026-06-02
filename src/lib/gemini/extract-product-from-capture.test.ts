import { FunctionCallingConfigMode } from '@google/genai';

import { extractProductFromCapture } from '@/lib/gemini/extract-product-from-capture';
import { EXTRACT_PRODUCT_FUNCTION_NAME } from '@/lib/gemini/constants';

describe('extractProductFromCapture', () => {
  it('forces the extract_product_details tool call and parses the response', async () => {
    const generateContent = jest.fn().mockResolvedValue({
      functionCalls: [
        {
          name: EXTRACT_PRODUCT_FUNCTION_NAME,
          args: {
            is_valid_product: true,
            title: 'Wireless Headphones',
            images: [],
            primary_url: 'https://shop.example/headphones',
            merchant_links: [],
            specs: { brand: 'Example Audio' },
            size: null,
            color: 'Black',
            quantity: null,
          },
        },
      ],
    });

    const client = {
      models: { generateContent },
    };

    const result = await extractProductFromCapture(
      {
        source_type: 'manual',
        manual_text: 'Black wireless headphones from Example Audio',
      },
      { client: client as never },
    );

    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          toolConfig: {
            functionCallingConfig: {
              mode: FunctionCallingConfigMode.ANY,
              allowedFunctionNames: [EXTRACT_PRODUCT_FUNCTION_NAME],
            },
          },
        }),
      }),
    );

    expect(result.product_snapshot.title).toBe('Wireless Headphones');
    expect(result.variant_details.color).toBe('Black');
  });

  it('throws when Gemini does not return a function call', async () => {
    const client = {
      models: {
        generateContent: jest.fn().mockResolvedValue({ functionCalls: [] }),
      },
    };

    await expect(
      extractProductFromCapture(
        { source_type: 'url', url: 'https://shop.example/item' },
        { client: client as never },
      ),
    ).rejects.toThrow('extract_product_details');
  });
});
