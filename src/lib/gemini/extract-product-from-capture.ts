import {
  FunctionCallingConfigMode,
  type GoogleGenAI,
} from '@google/genai';

import { getGeminiClient } from '@/lib/gemini/client';
import {
  buildExtractionContents,
  buildExtractionRequestConfig,
} from '@/lib/gemini/build-extraction-content';
import {
  EXTRACT_PRODUCT_FUNCTION_NAME,
  GEMINI_PRODUCT_MODEL,
} from '@/lib/gemini/constants';
import {
  extractProductFunctionDeclaration,
  parseExtractProductFunctionCall,
} from '@/lib/gemini/extract-product-tool';
import type {
  ExtractProductInput,
  ProductExtractionResult,
} from '@/types/product-extraction';

export class ProductExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductExtractionError';
  }
}

type ExtractProductOptions = {
  client?: GoogleGenAI;
};

export async function extractProductFromCapture(
  input: ExtractProductInput,
  options: ExtractProductOptions = {},
): Promise<ProductExtractionResult> {
  const client = options.client ?? getGeminiClient();

  const response = await client.models.generateContent({
    model: GEMINI_PRODUCT_MODEL,
    contents: buildExtractionContents(input),
    config: {
      ...buildExtractionRequestConfig(),
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

  if (!functionCall) {
    throw new ProductExtractionError(
      'Gemini did not return an extract_product_details function call.',
    );
  }

  if (functionCall.name !== EXTRACT_PRODUCT_FUNCTION_NAME) {
    throw new ProductExtractionError(
      `Unexpected function call: ${functionCall.name ?? 'unknown'}`,
    );
  }

  return parseExtractProductFunctionCall(functionCall.args);
}
