import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

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
    totpSecret: v.optional(v.string()), // Encrypted TOTP secret
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

  // Role enum: "admin" | "editor" | "viewer" | "removed"
  groupMemberships: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.string(), // "admin" | "editor" | "viewer" | "removed"
    joinedAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.id("users"), // Who last changed the role
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_user", ["groupId", "userId"])
    .index("by_group_role", ["groupId", "role"]),
});
