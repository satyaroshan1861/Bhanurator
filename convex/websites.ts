import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generate = mutation({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const website = await ctx.db.insert("websites", {
      userId,
      prompt: args.prompt,
      title: "Generating...",
      content: "<div>Generating your website...</div>"
    });

    await ctx.scheduler.runAfter(0, internal.websites.generateContent, {
      websiteId: website,
      prompt: args.prompt
    });

    return website;
  }
});

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("websites")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("desc")
      .collect();
  }
});

export const get = query({
  args: { id: v.id("websites") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

export const generateContent = internalAction({
  args: { 
    websiteId: v.id("websites"),
    prompt: v.string()
  },
  handler: async (ctx, args) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are a website generator. Generate a simple, valid HTML website based on the user's prompt. Include inline CSS styles. Do not include any external resources. Make it visually appealing."
        },
        {
          role: "user",
          content: args.prompt
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Failed to generate content");

    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "Generated Website";

    await ctx.runMutation(internal.websites.update, {
      id: args.websiteId,
      title,
      content
    });
  }
});

export const update = internalMutation({
  args: {
    id: v.id("websites"),
    title: v.string(),
    content: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      content: args.content
    });
  }
});
