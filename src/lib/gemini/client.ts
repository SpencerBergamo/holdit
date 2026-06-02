import { GoogleGenAI } from '@google/genai';

/** Node/server contexts only. Production mobile calls use the `resolve-product` Edge Function. */
let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
}

/** Clears the cached client (for tests). */
export function resetGeminiClient(): void {
  client = null;
}
