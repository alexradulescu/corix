import { QueryCtx } from "../_generated/server";
import { Id, Doc } from "../_generated/dataModel";

export type Role = "admin" | "editor" | "viewer" | "removed";

// Role hierarchy for future use (e.g., comparing permissions)
export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
  removed: 0,
};

export interface PermissionCheckResult {
  allowed: boolean;
  membership?: Doc<"groupMemberships">;
  error?: string;
}

export async function checkPermission(
  ctx: QueryCtx,
  userId: Id<"users">,
  groupId: Id<"groups">,
  requiredRoles: Role[]
): Promise<PermissionCheckResult> {
  const membership = await ctx.db
    .query("groupMemberships")
    .withIndex("by_group_user", (q) =>
      q.eq("groupId", groupId).eq("userId", userId)
    )
    .first();

  if (!membership) {
    return { allowed: false, error: "Not a member of this group" };
  }

  if (!requiredRoles.includes(membership.role as Role)) {
    return {
      allowed: false,
      membership,
      error: `Requires one of: ${requiredRoles.join(", ")}`,
    };
  }

  return { allowed: true, membership };
}

export async function countAdmins(
  ctx: QueryCtx,
  groupId: Id<"groups">
): Promise<number> {
  const admins = await ctx.db
    .query("groupMemberships")
    .withIndex("by_group_role", (q) =>
      q.eq("groupId", groupId).eq("role", "admin")
    )
    .collect();

  return admins.length;
}

export function canChangeRole(
  actorRole: Role,
  _targetCurrentRole: Role,
  _newRole: Role
): boolean {
  // Only admins can change roles
  if (actorRole !== "admin") {
    return false;
  }

  // Admins can change any role to any other role
  // Note: _targetCurrentRole and _newRole are available for future validation rules
  return true;
}

export function isActiveRole(role: Role): boolean {
  return role !== "removed";
}

export function hasPermission(role: Role, action: string): boolean {
  const permissions: Record<string, Role[]> = {
    "view:group": ["admin", "editor", "viewer"],
    "view:messages": ["admin", "editor", "viewer"],
    "post:messages": ["admin", "editor"],
    "manage:members": ["admin"],
    "manage:invitations": ["admin"],
    "view:audit": ["admin"],
    "delete:group": ["admin"],
    "update:settings": ["admin"],
  };

  const allowedRoles = permissions[action];
  if (!allowedRoles) {
    return false;
  }

  return allowedRoles.includes(role);
}
