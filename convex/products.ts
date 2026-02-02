import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const createProductManually = mutation({
  args: {
    name: v.string(),
    collectionId: v.id('collections'),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    url: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    size: v.optional(v.string()),
    color: v.optional(v.string()),
    brand: v.optional(v.string()),
  }, handler: async (ctx, {
    name,
    collectionId,
    description,
    imageUrl,
    url,
    price,
    currency,
    size,
    color,
    brand,
  }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const convexProfile = await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
    if (!convexProfile) throw new ConvexError('Convex profile not found');

    return await ctx.db.insert('products', {
      ownerId: convexProfile._id,
      collectionId,
      name,
      description,
      imageUrl,
      url,
      price,
      currency,
      size,
      color,
      brand,
      updatedAt: Date.now(),
    });
  }
});