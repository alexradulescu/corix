import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkPermission } from "./lib/permissions";
import { Id } from "./_generated/dataModel";

// Action types:
// - "member_invited"
// - "member_joined"
// - "member_left"
// - "member_removed"
// - "role_changed"
// - "invite_revoked"
// - "group_soft_deleted"
// - "group_restored"

// Internal mutation to create an audit log entry
export const createAuditLog = internalMutation({
  args: {
    groupId: v.id("groups"),
    actorId: v.id("users"),
    targetId: v.optional(v.id("users")),
    action: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", {
      groupId: args.groupId,
      actorId: args.actorId,
      targetId: args.targetId,
      action: args.action,
      details: args.details,
      createdAt: Date.now(),
    });
  },
});

// Get audit logs for a group (admin only)
export const getGroupAuditLogs = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Check if user is admin
    const permission = await checkPermission(ctx, userId, args.groupId, ["admin"]);
    if (!permission.allowed) {
      return [];
    }

    // Get audit logs ordered by createdAt descending
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_group_created", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(100); // Limit to 100 most recent logs

    // Enrich with actor and target user details
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const actor = await ctx.db.get(log.actorId);
        const target = log.targetId ? await ctx.db.get(log.targetId) : null;

        return {
          ...log,
          actorEmail: actor?.email || "Unknown User",
          targetEmail: target?.email || null,
        };
      })
    );

    return enrichedLogs;
  },
});

// Helper function to format action type into human-readable text
export function formatActionType(action: string): string {
  const actionMap: Record<string, string> = {
    member_invited: "Member Invited",
    member_joined: "Member Joined",
    member_left: "Member Left",
    member_removed: "Member Removed",
    role_changed: "Role Changed",
    invite_revoked: "Invitation Revoked",
    group_soft_deleted: "Group Soft Deleted",
    group_restored: "Group Restored",
  };

  return actionMap[action] || action;
}

// Helper to log audit events (to be called from other mutations)
export async function logAudit(
  ctx: any,
  params: {
    groupId: Id<"groups">;
    actorId: Id<"users">;
    targetId?: Id<"users">;
    action: string;
    details?: Record<string, any>;
  }
) {
  await ctx.db.insert("auditLogs", {
    groupId: params.groupId,
    actorId: params.actorId,
    targetId: params.targetId,
    action: params.action,
    details: params.details ? JSON.stringify(params.details) : undefined,
    createdAt: Date.now(),
  });
}
