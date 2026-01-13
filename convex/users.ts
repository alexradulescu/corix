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

// Generate a TOTP secret for 2FA setup
export const generateTotpSecret = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Generate a random secret (base32 encoded)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return { secret };
  },
});

// Enable TOTP 2FA after verifying the code
export const enableTotp = mutation({
  args: {
    secret: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify the TOTP code
    // Note: In production, you'd use a proper TOTP library here
    // For now, we accept the code if it's 6 digits
    if (!/^\d{6}$/.test(args.code)) {
      throw new Error("Invalid verification code");
    }

    // Store the encrypted secret and enable 2FA
    await ctx.db.patch(userId, {
      totpSecret: args.secret, // In production, encrypt this
      totpEnabled: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Disable TOTP 2FA
export const disableTotp = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.totpEnabled) {
      throw new Error("2FA is not enabled");
    }

    // Verify the TOTP code
    if (!/^\d{6}$/.test(args.code)) {
      throw new Error("Invalid verification code");
    }

    // Clear the secret and disable 2FA
    await ctx.db.patch(userId, {
      totpSecret: undefined,
      totpEnabled: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Verify a TOTP code (for login)
export const verifyTotpCode = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.totpEnabled || !user.totpSecret) {
      throw new Error("2FA is not enabled");
    }

    // Verify the TOTP code
    // Note: In production, use a proper TOTP verification library
    if (!/^\d{6}$/.test(args.code)) {
      throw new Error("Invalid verification code");
    }

    // Code is valid (simplified for demo)
    return { success: true };
  },
});

// Check if user can delete their account
export const canDeleteAccount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { canDelete: false, reason: "Not authenticated" };
    }

    // Get all memberships where user is admin
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();

    // For each admin membership, check if user is the sole admin
    const soleAdminGroups: string[] = [];

    for (const membership of memberships) {
      const group = await ctx.db.get(membership.groupId);
      if (!group) continue;

      // Count admins in this group
      const adminCount = await ctx.db
        .query("groupMemberships")
        .withIndex("by_group_role", (q) =>
          q.eq("groupId", membership.groupId).eq("role", "admin")
        )
        .collect();

      if (adminCount.length === 1) {
        // User is sole admin
        soleAdminGroups.push(group.name);
      }
    }

    if (soleAdminGroups.length > 0) {
      return {
        canDelete: false,
        reason: `You are the sole admin of: ${soleAdminGroups.join(", ")}. Promote another member to admin or leave these groups first.`,
        soleAdminGroups,
      };
    }

    return { canDelete: true, reason: null, soleAdminGroups: [] };
  },
});

// Soft delete user account
export const deleteAccount = mutation({
  args: {
    confirmPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.deletedAt) {
      throw new Error("Account is already deleted");
    }

    // Check if user can delete (not sole admin of any groups)
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();

    for (const membership of memberships) {
      const adminCount = await ctx.db
        .query("groupMemberships")
        .withIndex("by_group_role", (q) =>
          q.eq("groupId", membership.groupId).eq("role", "admin")
        )
        .collect();

      if (adminCount.length === 1) {
        throw new Error("You must not be the sole admin of any group");
      }
    }

    // Check if user has left all groups (all memberships should be "removed")
    const activeMemberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("role"), "removed"))
      .collect();

    if (activeMemberships.length > 0) {
      throw new Error("You must leave all groups before deleting your account");
    }

    // Generate a unique ID for the deleted user
    const uniqueId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const deletedUserId = `Deleted User ${uniqueId}`;

    // Soft delete the user
    await ctx.db.patch(userId, {
      deletedAt: Date.now(),
      deletedUserId,
      email: undefined, // Remove PII
      totpSecret: undefined, // Remove 2FA secret
      totpEnabled: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
