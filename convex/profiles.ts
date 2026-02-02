import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const getConvexProfile = query({
  args: {
    clerkId: v.optional(v.string()),
  }, handler: async (ctx, { clerkId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const profileToQuery = clerkId ? clerkId : identity.subject;
    return await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', profileToQuery)).first();
  }
})

export const createProfile = mutation({
  args: {
    name: v.string(),
    imageUrl: v.optional(v.string()),
  }, handler: async (ctx, { name, imageUrl }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const profileId = identity.subject;

    await ctx.db.insert('profiles', {
      clerkId: profileId,
      name,
      imageUrl,
      friends: [],
    });
  }
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }, handler: async (ctx, { name, imageUrl }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const profile = await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
    if (!profile) throw new ConvexError('Profile not found');

    await ctx.db.patch(profile._id, {
      name,
      imageUrl,
    });
  }
})

export const deleteProfile = mutation({
  args: {}, handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const profile = await ctx.db.query('profiles').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
    if (!profile) throw new ConvexError('Profile not found');

    await ctx.db.delete(profile._id);
  }
})