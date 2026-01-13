import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkPermission, countAdmins, Role } from "./lib/permissions";
import { logAudit } from "./auditLogs";

// Change a member's role
export const changeRole = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    const actorId = await getAuthUserId(ctx);
    if (!actorId) {
      throw new Error("Not authenticated");
    }

    const newRole = args.newRole as Role;
    if (!["admin", "editor", "viewer", "removed"].includes(newRole)) {
      throw new Error("Invalid role");
    }

    // Check if actor has permission to manage members
    const actorPermission = await checkPermission(ctx, actorId, args.groupId, ["admin"]);
    if (!actorPermission.allowed) {
      throw new Error("Only admins can change roles");
    }

    // Get the target membership
    const targetMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!targetMembership) {
      throw new Error("User is not a member of this group");
    }

    const currentRole = targetMembership.role as Role;

    // If demoting an admin, check if they're the last admin
    if (currentRole === "admin" && newRole !== "admin") {
      const adminCount = await countAdmins(ctx, args.groupId);
      if (adminCount <= 1) {
        throw new Error("Cannot remove the last admin. Promote another member to admin first.");
      }
    }

    // Update the role
    await ctx.db.patch(targetMembership._id, {
      role: newRole,
      updatedAt: Date.now(),
      updatedBy: actorId,
    });

    // Log audit event
    const action = newRole === "removed" ? "member_removed" : "role_changed";
    await logAudit(ctx, {
      groupId: args.groupId,
      actorId,
      targetId: args.userId,
      action,
      details: {
        previousRole: currentRole,
        newRole: newRole,
      },
    });

    return { success: true };
  },
});

// Leave a group (set self to removed)
export const leaveGroup = mutation({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the user's membership
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .first();

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    if (membership.role === "removed") {
      throw new Error("You have already left this group");
    }

    // If admin, check if they're the last admin
    if (membership.role === "admin") {
      const adminCount = await countAdmins(ctx, args.groupId);
      if (adminCount <= 1) {
        throw new Error("You are the last admin. Promote another member to admin before leaving.");
      }
    }

    const previousRole = membership.role;

    // Set role to removed
    await ctx.db.patch(membership._id, {
      role: "removed",
      updatedAt: Date.now(),
      updatedBy: userId,
    });

    // Log audit event
    await logAudit(ctx, {
      groupId: args.groupId,
      actorId: userId,
      targetId: userId,
      action: "member_left",
      details: {
        previousRole,
      },
    });

    return { success: true };
  },
});

// Get the current user's membership for a group
export const getMyMembership = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .first();

    return membership;
  },
});
