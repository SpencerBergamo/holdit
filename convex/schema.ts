import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    profiles: defineTable({

        friends: v.array(v.object({
            friendId: v.id('profiles'),
            status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('rejected'), v.literal('blocked')),
            requestedBy: v.id('profiles'),
            updatedAt: v.number(),
        }))
    }),

    collections: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        isPublic: v.boolean(),
        products: v.array(v.id('products')),
    }),

    products: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        url: v.optional(v.string()),
        price: v.optional(v.number()),
        currency: v.optional(v.string()),
        updatedAt: v.number(),
        size: v.optional(v.string()),
        color: v.optional(v.string()),
        brand: v.optional(v.string()),
    }).searchIndex('by_name', { searchField: 'name' }),
})