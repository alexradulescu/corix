import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { logAudit } from "./auditLogs";

// Get all groups the current user is a member of
export const myGroups = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get all memberships for the user
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get the groups for each membership
    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) return null;

        return {
          ...group,
          membership: {
            role: membership.role,
            joinedAt: membership.joinedAt,
          },
        };
      })
    );

    // Filter out null groups and sort by active first, then by name
    return groups
      .filter((g): g is NonNullable<typeof g> => g !== null)
      .sort((a, b) => {
        // Active groups before removed
        if (a.membership.role === "removed" && b.membership.role !== "removed") return 1;
        if (a.membership.role !== "removed" && b.membership.role === "removed") return -1;
        // Then sort by name
        return a.name.localeCompare(b.name);
      });
  },
});

// Get a single group by ID
export const getGroup = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      return null;
    }

    // Check if user is a member
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .first();

    if (!membership) {
      return null; // User is not a member
    }

    return {
      ...group,
      membership: {
        role: membership.role,
        joinedAt: membership.joinedAt,
      },
    };
  },
});

// Create a new group
export const createGroup = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const name = args.name.trim();
    if (!name) {
      throw new Error("Group name is required");
    }

    if (name.length > 100) {
      throw new Error("Group name must be less than 100 characters");
    }

    const now = Date.now();

    // Create the group
    const groupId = await ctx.db.insert("groups", {
      name,
      createdAt: now,
      createdBy: userId,
    });

    // Add creator as admin
    await ctx.db.insert("groupMemberships", {
      groupId,
      userId,
      role: "admin",
      joinedAt: now,
      updatedAt: now,
      updatedBy: userId,
    });

    return groupId;
  },
});

// Update group settings (name)
export const updateGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Check if user is an admin
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Only admins can update group settings");
    }

    const name = args.name.trim();
    if (!name) {
      throw new Error("Group name is required");
    }

    if (name.length > 100) {
      throw new Error("Group name must be less than 100 characters");
    }

    await ctx.db.patch(args.groupId, { name });

    return { success: true };
  },
});

// Get group members
export const getMembers = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Check if user is a member
    const userMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .first();

    if (!userMembership) {
      return []; // User is not a member
    }

    // Removed users can only see the group name, not members
    if (userMembership.role === "removed") {
      return [];
    }

    // Get all memberships for the group
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Get user details for each membership
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          membershipId: membership._id,
          userId: membership.userId,
          role: membership.role,
          joinedAt: membership.joinedAt,
          email: user?.email || user?.deletedUserId || "Unknown",
          isDeleted: !!user?.deletedAt,
        };
      })
    );

    // Sort: active members first (admin, editor, viewer), then removed
    const roleOrder = { admin: 0, editor: 1, viewer: 2, removed: 3 };
    return members.sort((a, b) => {
      const aOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 4;
      const bOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 4;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (a.email || "").localeCompare(b.email || "");
    });
  },
});

// Soft delete a group
export const softDeleteGroup = mutation({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.deletedAt) {
      throw new Error("Group is already soft deleted");
    }

    // Check if user is an admin
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", userId)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Only admins can soft delete groups");
    }

    // Set deletedAt on the group
    await ctx.db.patch(args.groupId, {
      deletedAt: Date.now(),
      deletedBy: userId,
    });

    // Get all memberships and set them to removed
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.patch(membership._id, {
        role: "removed",
        updatedAt: Date.now(),
        updatedBy: userId,
      });
    }

    // Log audit event
    await logAudit(ctx, {
      groupId: args.groupId,
      actorId: userId,
      action: "group_soft_deleted",
      details: {
        deletedBy: userId,
      },
    });

    return { success: true };
  },
});

// Restore a soft-deleted group (super-admin only)
export const restoreGroup = mutation({
  args: {
    groupId: v.id("groups"),
    newAdminId: v.id("users"), // Must specify at least one admin when restoring
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is a super-admin
    const user = await ctx.db.get(userId);
    if (!user || !user.isSuperAdmin) {
      throw new Error("Only super-admins can restore groups");
    }

    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (!group.deletedAt) {
      throw new Error("Group is not soft deleted");
    }

    // Clear deletedAt on the group
    await ctx.db.patch(args.groupId, {
      deletedAt: undefined,
      deletedBy: undefined,
    });

    // Find the membership for the new admin
    const newAdminMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.newAdminId)
      )
      .first();

    if (!newAdminMembership) {
      throw new Error("New admin must be a member of the group");
    }

    // Set the new admin's role to admin
    await ctx.db.patch(newAdminMembership._id, {
      role: "admin",
      updatedAt: Date.now(),
      updatedBy: userId,
    });

    // Log audit event
    await logAudit(ctx, {
      groupId: args.groupId,
      actorId: userId,
      targetId: args.newAdminId,
      action: "group_restored",
      details: {
        restoredBy: userId,
        newAdmin: args.newAdminId,
      },
    });

    return { success: true };
  },
});
