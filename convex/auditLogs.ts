import { query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkPermission } from "./lib/permissions";
import { Id } from "./_generated/dataModel";

// Recognised audit action types
export type AuditAction =
  | "member_invited"
  | "member_joined"
  | "member_left"
  | "member_removed"
  | "role_changed"
  | "invite_revoked"
  | "group_soft_deleted"
  | "group_restored";

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
          actorEmail: actor?.email || actor?.deletedUserId || "Unknown User",
          targetEmail: target?.email || target?.deletedUserId || null,
        };
      })
    );

    return enrichedLogs;
  },
});

// Human-readable labels for every audit action type.
// Single source of truth — imported by the frontend component.
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  member_invited: "Member Invited",
  member_joined: "Member Joined",
  member_left: "Member Left",
  member_removed: "Member Removed",
  role_changed: "Role Changed",
  invite_revoked: "Invitation Revoked",
  group_soft_deleted: "Group Soft Deleted",
  group_restored: "Group Restored",
};

// Helper to write an audit log entry from within a mutation.
// Using MutationCtx ensures this can only be called from mutations, not queries.
export async function logAudit(
  ctx: MutationCtx,
  params: {
    groupId: Id<"groups">;
    actorId: Id<"users">;
    targetId?: Id<"users">;
    action: AuditAction;
    details?: Record<string, unknown>;
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
