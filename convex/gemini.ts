import { ProductData } from "@/types/convex-types";
import { GoogleGenAI } from "@google/genai";
import { ConvexError, v } from "convex/values";
import { z } from "zod";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const productSchema = z.object({
  brand: z.string().describe('The brand of the product'),
  name: z.string().describe('The name or model of the product'),
  description: z.string().describe('The description of the product'),
  imageUrl: z.string().describe('The URL of the product image'),
  url: z.string().describe('The product page URL'),
  price: z.number().describe('The price of the product in the currency of the page'),
  currency: z.string().describe('The currency of the price'),
  size: z.string().describe('The size of the product selected by the user (if applicable)'),
  color: z.string().describe('The color of the product selected by the user (if applicable)'),
})

export async function getProductFromAI(input: any[]): Promise<ProductData> {
  const interaction = await genai.interactions.create({
    model: 'gemini-2.5-flash',
    input,
    response_format: z.toJSONSchema(productSchema),
    generation_config: {
      thinking_level: 'low',
    }
  });

  const textOutput = interaction.outputs?.find((o) => o.type === 'text');
  if (!textOutput || !textOutput.text) throw new ConvexError("No output from Gemini");

  return JSON.parse(textOutput.text);
}

export const newProductFromURL = action({
  args: {
    url: v.string(),
    collectionId: v.id('collections'),
  },
  handler: async (ctx, { url, collectionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const htmlResponse = await fetch(url);
    if (!htmlResponse.ok) throw new ConvexError('Failed to fetch HTML');

    const contentType = htmlResponse.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await htmlResponse.json()
      : await htmlResponse.text();

    const productData = await getProductFromAI([`Analyze this content and find the primary product details: ${data.substring(0, 5000)}`]);

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
  }
});