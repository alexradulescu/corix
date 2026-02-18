import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Reusable union validators — keep in sync with types in auditLogs.ts
const memberRole = v.union(
  v.literal("admin"),
  v.literal("editor"),
  v.literal("viewer"),
  v.literal("removed")
);

const invitationStatus = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("revoked")
);

const auditAction = v.union(
  v.literal("member_invited"),
  v.literal("member_joined"),
  v.literal("member_left"),
  v.literal("member_removed"),
  v.literal("role_changed"),
  v.literal("invite_revoked"),
  v.literal("group_soft_deleted"),
  v.literal("group_restored")
);

export default defineSchema({
  ...authTables,

  users: defineTable({
    // Convex Auth fields (managed automatically)
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),

    // Profile
    deletedAt: v.optional(v.number()), // Soft delete timestamp
    deletedUserId: v.optional(v.string()), // "Deleted User {uniqueId}" replacement

    // 2FA
    totpSecret: v.optional(v.string()),
    totpEnabled: v.optional(v.boolean()),

    // System
    isSuperAdmin: v.optional(v.boolean()), // Manually set in DB
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_deleted", ["deletedAt"]),

  groups: defineTable({
    name: v.string(),
    createdAt: v.number(),
    createdBy: v.id("users"),

    // Soft delete
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id("users")),
  })
    .index("by_deleted", ["deletedAt"])
    .index("by_creator", ["createdBy"]),

  groupMemberships: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: memberRole,
    joinedAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_user", ["groupId", "userId"])
    .index("by_group_role", ["groupId", "role"]),

  invitations: defineTable({
    groupId: v.id("groups"),
    email: v.string(),
    invitedBy: v.id("users"),
    createdAt: v.number(),
    status: invitationStatus,
    acceptedAt: v.optional(v.number()),
    acceptedBy: v.optional(v.id("users")),
  })
    .index("by_group", ["groupId"])
    .index("by_email", ["email"])
    .index("by_group_email", ["groupId", "email"])
    .index("by_status", ["status"]),

  messages: defineTable({
    groupId: v.id("groups"),
    authorId: v.id("users"),
    content: v.string(), // Max 500 characters, plain text
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_group_created", ["groupId", "createdAt"])
    .index("by_author", ["authorId"]),

  auditLogs: defineTable({
    groupId: v.id("groups"),
    actorId: v.id("users"),
    targetId: v.optional(v.id("users")),
    action: auditAction,
    details: v.optional(v.string()), // JSON-encoded extra context
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_group_created", ["groupId", "createdAt"])
    .index("by_actor", ["actorId"]),
});
