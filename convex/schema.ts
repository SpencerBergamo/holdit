import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    profiles: defineTable({
        name: v.string(),
        imageUrl: v.optional(v.string()),
        clerkId: v.string(),
        pinnedCollections: v.optional(v.array(v.id('collections'))),
        friends: v.array(v.object({
            friendId: v.id('profiles'),
            status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('rejected'), v.literal('blocked')),
            requestedBy: v.id('profiles'),
            updatedAt: v.number(),
        }))
    }).index('by_clerk_id', ['clerkId'])
        .index('by_pinned_collections', ['pinnedCollections']),

    collections: defineTable({
        ownerId: v.id('profiles'),
        name: v.string(),
        description: v.optional(v.string()),
        isPublic: v.boolean(),
        numberOfItems: v.number(),
    }).index('by_owner_id', ['ownerId']),

    products: defineTable({
        ownerId: v.id('profiles'),
        collectionId: v.optional(v.id('collections')),
        priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
        purchased: v.optional(v.boolean()),
        updatedAt: v.number(),
        name: v.string(),
        description: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        url: v.optional(v.string()),
        price: v.optional(v.number()),
        currency: v.optional(v.string()),
        size: v.optional(v.string()),
        color: v.optional(v.string()),
        brand: v.optional(v.string()),
    }).index('by_owner_id', ['ownerId'])
        .index('by_collection_id', ['collectionId'])
        .searchIndex('by_name', { searchField: 'name' }),
})