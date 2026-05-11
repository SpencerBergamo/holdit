import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";


export const generateUploadUrl = mutation({
  args: {}, handler: async (ctx, { }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    return await ctx.storage.generateUploadUrl();
  },
});

export const serveFile = mutation({
  args: { storageId: v.id('_storage') }, handler: async (ctx, { storageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    return await ctx.storage.getUrl(storageId);
  }
})