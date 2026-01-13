import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkPermission } from "./lib/permissions";
import { paginationOptsValidator } from "convex/server";

// Create a new message in a group
export const createMessage = mutation({
  args: {
    groupId: v.id("groups"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate content
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Message content cannot be empty");
    }

    if (trimmedContent.length > 500) {
      throw new Error("Message content cannot exceed 500 characters");
    }

    // Check if user has permission to post (admin or editor)
    const permission = await checkPermission(ctx, userId, args.groupId, ["admin", "editor"]);
    if (!permission.allowed) {
      throw new Error("Only admins and editors can post messages");
    }

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      groupId: args.groupId,
      authorId: userId,
      content: trimmedContent,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Get messages for a group with pagination
export const getMessages = query({
  args: {
    groupId: v.id("groups"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], continueCursor: null, isDone: true };
    }

    // Check if user has permission to view messages (viewer or above)
    const permission = await checkPermission(ctx, userId, args.groupId, [
      "admin",
      "editor",
      "viewer",
    ]);
    if (!permission.allowed) {
      return { page: [], continueCursor: null, isDone: true };
    }

    // Get messages ordered by createdAt descending (newest first)
    const result = await ctx.db
      .query("messages")
      .withIndex("by_group_created", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich messages with author information
    const enrichedMessages = await Promise.all(
      result.page.map(async (message) => {
        const author = await ctx.db.get(message.authorId);

        // Handle deleted users
        let authorDisplay = "Unknown User";
        if (author) {
          if (author.deletedAt) {
            authorDisplay = author.deletedUserId || "Deleted User";
          } else {
            authorDisplay = author.email || "Unknown User";
          }
        }

        return {
          ...message,
          authorDisplay,
        };
      })
    );

    return {
      ...result,
      page: enrichedMessages,
    };
  },
});

// Get recent messages for a group (non-paginated, for simple display)
export const getRecentMessages = query({
  args: {
    groupId: v.id("groups"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Check if user has permission to view messages (viewer or above)
    const permission = await checkPermission(ctx, userId, args.groupId, [
      "admin",
      "editor",
      "viewer",
    ]);
    if (!permission.allowed) {
      return [];
    }

    const limit = args.limit || 50;

    // Get messages ordered by createdAt descending (newest first)
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_group_created", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(limit);

    // Enrich messages with author information
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.authorId);

        // Handle deleted users
        let authorDisplay = "Unknown User";
        if (author) {
          if (author.deletedAt) {
            authorDisplay = author.deletedUserId || "Deleted User";
          } else {
            authorDisplay = author.email || "Unknown User";
          }
        }

        return {
          ...message,
          authorDisplay,
        };
      })
    );

    return enrichedMessages;
  },
});
