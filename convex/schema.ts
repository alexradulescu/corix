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
});
