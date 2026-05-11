import { ProductData } from "@/types/convex-types";
import { httpRouter } from "convex/server";
import { ConvexError } from "convex/values";
import { httpAction } from "./_generated/server";
import { getProductFromURL } from "./gemini";

// ============================================================================
// Constants
// ============================================================================

const http = httpRouter();

const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_CONTENT_LENGTH = 50000; // 50KB for AI input

// ============================================================================
// Response Helpers
// ============================================================================

export function jsonResponse(
  data: Record<string, unknown>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export function errorResponse(
  message: string,
  status: number = 400,
  code?: string
): Response {
  return jsonResponse(
    {
      success: false,
      error: {
        message,
        code: code ?? `HTTP_${status}`,
      },
    },
    status
  );
}

async function fetchUrlContent(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HoldIt-Bot/1.0 (Product Extraction)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new ConvexError(`Failed to fetch URL: HTTP ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const json = await response.json();
      return JSON.stringify(json);
    }

    return await response.text();
  } catch (e) {
    if (e instanceof ConvexError) throw e;
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ConvexError('Request timed out while fetching URL');
    }
    throw new ConvexError(`Failed to fetch URL: ${e instanceof Error ? e.message : 'Unknown error'}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

function validateProductURL(url: string): URL {
  if (!url || typeof url !== 'string') {
    throw new ConvexError('URL is required');
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    throw new ConvexError('URL cannot be empty');
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new ConvexError('URL must use HTTP or HTTPS protocol');
    }
    return parsedUrl;
  } catch (e) {
    if (e instanceof ConvexError) throw e;
    throw new ConvexError(`Invalid URL format: ${trimmedUrl}`);
  }
}

// ============================================================================
// Routes
// ============================================================================

http.route({
  path: '/product-link',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return errorResponse('Invalid JSON in request body', 400, 'INVALID_JSON');
      }

      const { url } = body as { url: string };
      const parsedUrl = validateProductURL(url);
      const rawContent = await fetchUrlContent(parsedUrl.toString());

      const content = rawContent.length > MAX_CONTENT_LENGTH
        ? rawContent.substring(0, MAX_CONTENT_LENGTH)
        : rawContent;

      const input = [
        `Analyze the content from ${parsedUrl.hostname} and find the primary product details. ` +
        `Extract the brand, name, description, price, and any other relevant information. ` +
        `If you cannot determine specific information, use empty strings or 0 for numbers.` +
        `Content: ${content}`,
      ];

      const productData: ProductData = await getProductFromURL([input]);

      return jsonResponse({
        success: true,
        product: productData,
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        return errorResponse(error.data as string, 400, 'VALIDATION_ERROR');
      }

      console.error('Unexpected error in /find-product:', error);
      return errorResponse(
        'An unexpected error occurred while processing your request',
        500,
        'INTERNAL_ERROR'
      );
    }
  })
});

http.route({
  path: '/product-image',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {

    return jsonResponse({
      success: true,
      message: 'Product image processed successfully',
    });
  })
})

/**
 * GET /health
 * Health check endpoint
 */
http.route({
  path: '/health',
  method: 'GET',
  handler: httpAction(async () => {
    return jsonResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  })
});

export default http;
