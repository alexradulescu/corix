import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import * as OTPAuth from "otpauth";

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

// Note: Password changes are handled through Convex Auth's built-in password reset flow.
// Users should use the "Forgot Password" link to change their password.
// This ensures proper validation and security through the auth provider.

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

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate a secure random secret using OTPAuth
    const secret = new OTPAuth.Secret({ size: 20 });

    // Create TOTP instance for QR code generation
    const totp = new OTPAuth.TOTP({
      issuer: "Corix",
      label: user.email || "User",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    return {
      secret: secret.base32,
      uri: totp.toString() // For QR code generation
    };
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

    // Verify the TOTP code using OTPAuth
    const totp = new OTPAuth.TOTP({
      issuer: "Corix",
      label: user.email || "User",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(args.secret),
    });

    // Validate with a window of ±1 period (allows for clock skew)
    const delta = totp.validate({ token: args.code, window: 1 });

    if (delta === null) {
      throw new Error("Invalid verification code. Please try again.");
    }

    // Store the secret and enable 2FA
    await ctx.db.patch(userId, {
      totpSecret: args.secret,
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

    if (!user.totpEnabled || !user.totpSecret) {
      throw new Error("2FA is not enabled");
    }

    // Verify the TOTP code using OTPAuth
    const totp = new OTPAuth.TOTP({
      issuer: "Corix",
      label: user.email || "User",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    });

    // Validate with a window of ±1 period (allows for clock skew)
    const delta = totp.validate({ token: args.code, window: 1 });

    if (delta === null) {
      throw new Error("Invalid verification code. Please try again.");
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

    // Verify the TOTP code using OTPAuth
    const totp = new OTPAuth.TOTP({
      issuer: "Corix",
      label: user.email || "User",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    });

    // Validate with a window of ±1 period (allows for clock skew)
    const delta = totp.validate({ token: args.code, window: 1 });

    if (delta === null) {
      throw new Error("Invalid verification code. Please try again.");
    }

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

// Soft delete user account.
// Note: Password re-verification is not possible server-side with Convex Auth.
// Security relies on the confirmed sole-admin check and the "leave all groups" requirement.
// The frontend additionally requires the user to type "DELETE" to confirm intent.
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
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

    // Generate a unique ID for the deleted user placeholder
    const uniqueId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const deletedUserId = `Deleted User ${uniqueId}`;

    // Soft delete the user and remove all PII
    await ctx.db.patch(userId, {
      deletedAt: Date.now(),
      deletedUserId,
      email: undefined,
      totpSecret: undefined,
      totpEnabled: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get all users in the system (super-admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Check if user is a super-admin
    const user = await ctx.db.get(userId);
    if (!user || !user.isSuperAdmin) {
      return [];
    }

    // Get all users including soft-deleted ones
    const users = await ctx.db.query("users").collect();

    // Enrich with membership and group count
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const memberships = await ctx.db
          .query("groupMemberships")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const activeMemberships = memberships.filter((m) => m.role !== "removed");
        const adminMemberships = memberships.filter((m) => m.role === "admin");

        return {
          ...user,
          membershipCount: memberships.length,
          activeMemberships: activeMemberships.length,
          adminOfGroups: adminMemberships.length,
        };
      })
    );

    // Sort: active users first, then by creation date
    return enrichedUsers.sort((a, b) => {
      if (a.deletedAt && !b.deletedAt) return 1;
      if (!a.deletedAt && b.deletedAt) return -1;
      return (b.creationTime || 0) - (a.creationTime || 0);
    });
  },
});

// Hard delete a user (super-admin only)
export const hardDeleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) {
      throw new Error("Not authenticated");
    }

    // Check if admin is a super-admin
    const admin = await ctx.db.get(adminId);
    if (!admin || !admin.isSuperAdmin) {
      throw new Error("Only super-admins can hard delete users");
    }

    // Can't delete yourself
    if (args.userId === adminId) {
      throw new Error("You cannot delete your own account");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete all related data
    // 1. Delete all memberships
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // 2. Delete all invitations created by this user
    const invitations = await ctx.db
      .query("invitations")
      .filter((q) => q.eq(q.field("invitedBy"), args.userId))
      .collect();
    for (const invitation of invitations) {
      await ctx.db.delete(invitation._id);
    }

    // 3. Delete all audit logs where user is the actor
    const auditLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_actor", (q) => q.eq("actorId", args.userId))
      .collect();
    for (const auditLog of auditLogs) {
      await ctx.db.delete(auditLog._id);
    }

    // 4. Keep messages but they'll show as deleted user via deletedUserId
    // Messages are preserved for historical context

    // 5. Delete the user itself
    await ctx.db.delete(args.userId);

    return { success: true };
  },
});
