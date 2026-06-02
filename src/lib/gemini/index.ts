export {
  EXTRACT_PRODUCT_FUNCTION_NAME,
  GEMINI_PRODUCT_MODEL,
  PRODUCT_EXTRACTION_SYSTEM_INSTRUCTION,
} from '@/lib/gemini/constants';
export { getGeminiClient, resetGeminiClient } from '@/lib/gemini/client';
export {
  extractProductFunctionDeclaration,
  extractProductArgsSchema,
  mapExtractProductArgsToResult,
  parseExtractProductFunctionCall,
  type ExtractProductArgs,
} from '@/lib/gemini/extract-product-tool';
export {
  extractProductFromCapture,
  ProductExtractionError,
} from '@/lib/gemini/extract-product-from-capture';
export { buildExtractionContents } from '@/lib/gemini/build-extraction-content';
