import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserProducts = query({
  args: {
    paginationOpts: paginationOptsValidator,
  }, handler: async (ctx, { paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const convexProfile = await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
    if (!convexProfile) throw new ConvexError('Convex profile not found');

    return await ctx.db
      .query('products')
      .withIndex('by_owner_id', q => q.eq('ownerId', convexProfile._id))
      .order('desc')
      .paginate(paginationOpts);
  }
})

export const newProduct = mutation({
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
  }, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const convexProfile = await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
    if (!convexProfile) throw new ConvexError('Convex profile not found');

    return await ctx.db.insert('products', {
      ownerId: convexProfile._id,
      collectionId: args.collectionId,
      name: args.name,
      description: args.description,
      imageUrl: args.imageUrl,
      url: args.url,
      price: args.price,
      currency: args.currency,
      size: args.size,
      color: args.color,
      brand: args.brand,
      updatedAt: Date.now(),
    });
  }
});