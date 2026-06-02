import type { Content, Part } from '@google/genai';

import { PRODUCT_EXTRACTION_SYSTEM_INSTRUCTION } from '@/lib/gemini/constants';
import type { ExtractProductInput } from '@/types/product-extraction';

function appendNotes(base: string, notes?: string | null): string {
  const trimmedNotes = notes?.trim();
  if (!trimmedNotes) {
    return base;
  }

  return `${base}\n\nAdditional user notes: ${trimmedNotes}`;
}

function buildUserPrompt(input: ExtractProductInput): string {
  switch (input.source_type) {
    case 'url':
      return appendNotes(
        `Extract product details from this merchant URL:\n${input.url}`,
        input.notes,
      );
    case 'manual':
      return appendNotes(
        `Extract product details from this manual description:\n${input.manual_text}`,
        input.notes,
      );
    case 'photo':
      return appendNotes(
        'Extract product details from the attached product photo.',
        input.notes,
      );
  }
}

export function buildExtractionContents(input: ExtractProductInput): Content[] {
  const parts: Part[] = [{ text: buildUserPrompt(input) }];

  if (input.source_type === 'photo') {
    parts.push({
      inlineData: {
        mimeType: input.mime_type,
        data: input.photo_base64,
      },
    });
  }

  return [
    {
      role: 'user',
      parts,
    },
  ];
}

export function buildExtractionRequestConfig() {
  return {
    systemInstruction: PRODUCT_EXTRACTION_SYSTEM_INSTRUCTION,
  };
}
