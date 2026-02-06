import { ProductData } from "@/types/convex-types";
import { httpRouter } from "convex/server";
import { Base64 } from "convex/values";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { getProductFromAI } from "./gemini";

const http = httpRouter();

http.route({
  path: '/find-product',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const { base64, mimeType, collectionId } = await req.json();

    const bytes = Base64.toByteArray(base64);
    const blob = new Blob([new Uint8Array(bytes)], { type: mimeType ?? 'application/octet-stream' });

    const input = [
      `Analyze this image and find the primary product details`,
      {
        type: 'image',
        data: blob,
        mimeType: mimeType ?? 'application/octet-stream',
      }
    ];

    const productData: ProductData = await getProductFromAI([input]);

    await ctx.runMutation(api.products.newProduct, {
      collectionId,
      name: productData.name ?? '',
      brand: productData.brand ?? '',
      description: productData.description ?? '',
      imageUrl: productData.imageUrl ?? '',
      url: productData.url ?? '',
      price: productData.price ?? 0,
      currency: productData.currency ?? '',
      size: productData.size ?? '',
      color: productData.color ?? '',
    });

    return new Response(JSON.stringify({ success: true }));
  })
});