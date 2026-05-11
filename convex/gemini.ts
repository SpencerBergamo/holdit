import { ProductData } from "@/types/convex-types";
import { GoogleGenAI, } from "@google/genai";
import { ConvexError } from "convex/values";
import { z } from "zod";
import { Id } from "./_generated/dataModel";


// ============================================================================
// Constants
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set - Gemini features will not work');
}

const genai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export const productSchema = z.object({
  brand: z.string().describe('The brand of the product'),
  name: z.string().describe('The name or model of the product'),
  description: z.string().describe('The description of the product'),
  imageUrl: z.string().describe('The URL of the product image'),
  url: z.string().describe('The product page URL'),
  price: z.number().describe('The price of the product in the currency of the page'),
  currency: z.string().describe('The currency of the price'),
  size: z.string().describe('The size of the product selected by the user (if applicable)'),
  color: z.string().describe('The color of the product selected by the user (if applicable)'),
});

const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

const RETRYABLE_ERROR_PATTERNS = [
  'rate limit',
  'quota exceeded',
  'timeout',
  '503',
  '429',
  'temporarily unavailable',
  'internal error',
];

// ============================================================================
// Helper Functions
// ============================================================================

function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return RETRYABLE_ERROR_PATTERNS.some(pattern => message.includes(pattern));
}

function calculateBackoffDelay(attempt: number): number {
  const baseDelay = RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
  return Math.min(baseDelay + jitter, RETRY_CONFIG.maxDelayMs);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function validateInput(input: unknown[]): void {
  if (!Array.isArray(input)) {
    throw new ConvexError('Input must be an array');
  }
  if (input.length === 0) {
    throw new ConvexError('Input array cannot be empty');
  }
  // Check for excessively large inputs
  const inputStr = JSON.stringify(input);
  if (inputStr.length > 1_000_000) { // 1MB limit
    throw new ConvexError('Input exceeds maximum size limit');
  }
}

// ============================================================================
// Response Helpers
// ============================================================================

export function parseGeminiResponse(responseText: string): ProductData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch (e) {
    throw new ConvexError(`Failed to parse Gemini response as JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }

  // Validate against schema with safe parsing
  const result = productSchema.safeParse(parsed);

  if (!result.success) {
    // Return partial data with defaults for missing fields
    const partialData = parsed as Record<string, unknown>;
    return {
      brand: typeof partialData.brand === 'string' ? partialData.brand : '',
      name: typeof partialData.name === 'string' ? partialData.name : '',
      description: typeof partialData.description === 'string' ? partialData.description : '',
      imageUrl: typeof partialData.imageUrl === 'string' ? partialData.imageUrl : '',
      url: typeof partialData.url === 'string' ? partialData.url : '',
      price: typeof partialData.price === 'number' ? partialData.price : 0,
      currency: typeof partialData.currency === 'string' ? partialData.currency : 'USD',
      size: typeof partialData.size === 'string' ? partialData.size : '',
      color: typeof partialData.color === 'string' ? partialData.color : '',
    };
  }

  return result.data;
}

// ============================================================================
// Main Function
// ============================================================================

export async function getProductFromURL(input: any[]): Promise<ProductData> {
  if (!genai) throw new ConvexError('Gemini API is not configured. Please set GEMINI_API_KEY environment variable.');

  validateInput(input);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const interaction = await genai.interactions.create({
        model: 'gemini-2.5-flash',
        input,
        response_format: z.toJSONSchema(productSchema),
        generation_config: {
          thinking_level: 'low',
        }
      });

      const textOutput = interaction.outputs?.find((o) => o.type === 'text');
      if (!textOutput || !textOutput.text) {
        throw new ConvexError('No text output received from Gemini');
      }

      return parseGeminiResponse(textOutput.text);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors or non-retryable errors
      if (error instanceof ConvexError || !isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === RETRY_CONFIG.maxRetries) {
        break;
      }

      const delay = calculateBackoffDelay(attempt);
      console.log(`Gemini API call failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}), retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw new ConvexError(`Gemini API call failed after ${RETRY_CONFIG.maxRetries + 1} attempts: ${lastError?.message ?? 'Unknown error'}`);
}

export async function getProductFromImage(storageId: Id<'_storage'>) { }
