import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createCollection = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, { name, description, isPublic }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const clerkId = identity.subject;
    const convexProfile = await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', clerkId)).first();
    if (!convexProfile) throw new ConvexError('Owner not found');

    await ctx.db.insert('collections', {
      ownerId: convexProfile._id,
      name,
      description,
      isPublic,
      numberOfItems: 0,
    });
  },
});

export const updateCollection = mutation({
  args: {
    collectionId: v.id('collections'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { collectionId, name, description, isPublic }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const clerkId = identity.subject;
    const convexProfile = await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', clerkId)).first();
    if (!convexProfile) throw new ConvexError('Convex profile not found');

    const collection = await ctx.db.get(collectionId);
    if (!collection) throw new ConvexError('Collection not found');

    if (collection.ownerId !== convexProfile._id) throw new ConvexError('Unauthorized');

    await ctx.db.patch(collectionId, {
      name,
      description,
      isPublic,
    });
  }
});

export const deleteCollection = mutation({
  args: {
    collectionId: v.id('collections'),
  }, handler: async (ctx, { collectionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const clerkId = identity.subject;
    const convexProfile = await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', clerkId)).first();
    if (!convexProfile) throw new ConvexError('Convex profile not found');

    const collection = await ctx.db.get(collectionId);
    if (!collection) throw new ConvexError('Collection not found');

    if (collection.ownerId !== convexProfile._id) throw new ConvexError('Unauthorized');

    await ctx.db.delete(collectionId);
  }
});

export const getUserCollections = query({
  args: {
    paginationOpts: paginationOptsValidator,
  }, handler: async (ctx, { paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const convexProfile = await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
    if (!convexProfile) throw new ConvexError('Convex profile not found');

    return await ctx.db.query('collections')
      .withIndex('by_owner_id', q => q.eq('ownerId', convexProfile._id))
      .order('desc')
      .paginate(paginationOpts);
  }
})

export const getPinnedCollections = query({
  args: {}, handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const clerkId = identity.subject;
    const convexProfile = await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', clerkId)).first();
    if (!convexProfile) throw new ConvexError('Convex profile not found');

    const pinned = convexProfile.pinnedCollections;
    if (!pinned) return [];

    const collections = await Promise.all(
      pinned.map((id) => ctx.db.get(id))
    );

    return collections
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
});