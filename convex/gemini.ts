import { v } from "convex/values";
import { action } from "./_generated/server";

const API_KEY = process.env.GEMINI_API_KEY;

export const searchProdct = action({
  args: {
    params: v.optional(v.object({
      title: v.optional(v.string()),
      size: v.optional(v.string()),
    }))
  }, handler: async (ctx) => {


  }
})