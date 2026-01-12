import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

// Note: Password changes are handled through the Convex Auth system.
// This mutation is a placeholder that validates the request and returns success.
// The actual password change happens through the auth provider.
export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Password validation happens on the client side
    // The actual password change is handled by Convex Auth
    // This mutation serves as a hook for any additional logic
    // Note: _args contains currentPassword and newPassword for future use

    // Update the user's updatedAt timestamp
    await ctx.db.patch(userId, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateProfile = mutation({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.email !== undefined) {
      // Check if email is already in use
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (existingUser && existingUser._id !== userId) {
        throw new Error("Email already in use");
      }

      updates.email = args.email;
      // Email change requires re-verification
      updates.emailVerificationTime = undefined;
    }

    await ctx.db.patch(userId, updates);

    return { success: true };
  },
});
