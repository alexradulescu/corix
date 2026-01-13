import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkPermission } from "./lib/permissions";
import { api } from "./_generated/api";
import { logAudit } from "./auditLogs";

// Create an invitation to a group
export const createInvitation = mutation({
  args: {
    groupId: v.id("groups"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Normalize email
    const email = args.email.toLowerCase().trim();
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    // Check if actor has permission (must be admin)
    const permission = await checkPermission(ctx, userId, args.groupId, ["admin"]);
    if (!permission.allowed) {
      throw new Error("Only admins can invite members");
    }

    // Check if user is already a member (any role including removed)
    const existingMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Get the user ID for this email if they exist
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      const membership = existingMembership.find((m) => m.userId === existingUser._id);
      if (membership) {
        throw new Error("User is already a member of this group");
      }
    }

    // Check if pending invite exists for this email + group
    const existingInvite = await ctx.db
      .query("invitations")
      .withIndex("by_group_email", (q) =>
        q.eq("groupId", args.groupId).eq("email", email)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      throw new Error("Invitation already pending for this email");
    }

    // Get group details for the email
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Create invitation record
    const invitationId = await ctx.db.insert("invitations", {
      groupId: args.groupId,
      email,
      invitedBy: userId,
      createdAt: Date.now(),
      status: "pending",
    });

    // Log audit event
    await logAudit(ctx, {
      groupId: args.groupId,
      actorId: userId,
      action: "member_invited",
      details: {
        email,
      },
    });

    // Schedule sending the email
    await ctx.scheduler.runAfter(0, api.invitations.sendInvitationEmail, {
      invitationId,
      email,
      groupName: group.name,
    });

    return { invitationId };
  },
});

// Send invitation email via Resend
export const sendInvitationEmail = action({
  args: {
    invitationId: v.id("invitations"),
    email: v.string(),
    groupName: v.string(),
  },
  handler: async (ctx, args) => {
    const inviteUrl = `${process.env.SITE_URL || "http://localhost:5173"}/invite/${args.invitationId}`;

    // Try to send email via Resend if configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_")) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: process.env.FROM_EMAIL || "onboarding@resend.dev",
          to: args.email,
          subject: `You're invited to join ${args.groupName}`,
          html: `
            <h2>You've been invited to join ${args.groupName}</h2>
            <p>You've been invited to join the group "${args.groupName}" on Corix.</p>
            <p><a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${inviteUrl}</p>
            <p>If you don't have an account yet, you'll be able to create one when you accept the invitation.</p>
          `,
        });

        console.log(`✅ Invitation email sent to ${args.email}`);
        return { success: true, method: "email" };
      } catch (error) {
        console.error("Failed to send email via Resend:", error);
        // Fall through to console logging
      }
    }

    // Fallback: log to console (useful for development)
    console.log(`
===========================================
INVITATION EMAIL (Console Fallback)
===========================================
To: ${args.email}
Subject: You're invited to join ${args.groupName}

You've been invited to join the group "${args.groupName}".

Click the link below to accept the invitation:
${inviteUrl}

If you don't have an account yet, you'll be able to create one when you accept the invitation.
===========================================
    `);

    return { success: true, method: "console" };
  },
});

// Accept an invitation (for registered/logged-in users)
export const acceptInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the invitation
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new Error("This invitation is no longer valid");
    }

    // Get user's email
    const user = await ctx.db.get(userId);
    if (!user || !user.email) {
      throw new Error("User not found");
    }

    // Verify the invitation is for this user's email
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error("This invitation is not for your email address");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", invitation.groupId).eq("userId", userId)
      )
      .first();

    if (existingMembership && existingMembership.role !== "removed") {
      throw new Error("You are already a member of this group");
    }

    // If user was previously removed, update their role
    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        role: "viewer",
        updatedAt: Date.now(),
        updatedBy: userId,
      });
    } else {
      // Create new membership with "viewer" role
      await ctx.db.insert("groupMemberships", {
        groupId: invitation.groupId,
        userId: userId,
        role: "viewer",
        joinedAt: Date.now(),
        updatedAt: Date.now(),
        updatedBy: userId,
      });
    }

    // Update invitation status
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
      acceptedAt: Date.now(),
      acceptedBy: userId,
    });

    // Log audit event
    await logAudit(ctx, {
      groupId: invitation.groupId,
      actorId: userId,
      targetId: userId,
      action: "member_joined",
      details: {
        role: "viewer",
        viaInvite: true,
      },
    });

    return { groupId: invitation.groupId };
  },
});

// Auto-accept invitations when user verifies email or registers
export const autoAcceptInvitations = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const email = args.email.toLowerCase();

    // Find all pending invitations for this email
    const pendingInvitations = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Accept each invitation
    for (const invitation of pendingInvitations) {
      // Check if user is already a member
      const existingMembership = await ctx.db
        .query("groupMemberships")
        .withIndex("by_group_user", (q) =>
          q.eq("groupId", invitation.groupId).eq("userId", userId)
        )
        .first();

      if (!existingMembership || existingMembership.role === "removed") {
        if (existingMembership) {
          // Restore removed member
          await ctx.db.patch(existingMembership._id, {
            role: "viewer",
            updatedAt: Date.now(),
            updatedBy: userId,
          });
        } else {
          // Create new membership
          await ctx.db.insert("groupMemberships", {
            groupId: invitation.groupId,
            userId: userId,
            role: "viewer",
            joinedAt: Date.now(),
            updatedAt: Date.now(),
            updatedBy: userId,
          });
        }

        // Update invitation status
        await ctx.db.patch(invitation._id, {
          status: "accepted",
          acceptedAt: Date.now(),
          acceptedBy: userId,
        });

        // Log audit event
        await logAudit(ctx, {
          groupId: invitation.groupId,
          actorId: userId,
          targetId: userId,
          action: "member_joined",
          details: {
            role: "viewer",
            viaInvite: true,
          },
        });
      }
    }

    return { count: pendingInvitations.length };
  },
});

// Revoke an invitation
export const revokeInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the invitation
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check if actor has permission (must be admin)
    const permission = await checkPermission(ctx, userId, invitation.groupId, ["admin"]);
    if (!permission.allowed) {
      throw new Error("Only admins can revoke invitations");
    }

    if (invitation.status !== "pending") {
      throw new Error("Only pending invitations can be revoked");
    }

    // Update invitation status
    await ctx.db.patch(args.invitationId, {
      status: "revoked",
    });

    // Log audit event
    await logAudit(ctx, {
      groupId: invitation.groupId,
      actorId: userId,
      action: "invite_revoked",
      details: {
        email: invitation.email,
      },
    });

    return { success: true };
  },
});

// Get pending invitations for a group (admin only)
export const getPendingInvitations = query({
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

    // Get all pending invitations for this group
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Enrich with inviter details
    const enrichedInvitations = await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db.get(invitation.invitedBy);
        return {
          ...invitation,
          inviterEmail: inviter?.email || "Unknown",
        };
      })
    );

    return enrichedInvitations;
  },
});

// Get invitation by ID (public - for accepting invites)
export const getInvitation = query({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      return null;
    }

    // Get group details
    const group = await ctx.db.get(invitation.groupId);
    if (!group) {
      return null;
    }

    // Get inviter details
    const inviter = await ctx.db.get(invitation.invitedBy);

    return {
      ...invitation,
      groupName: group.name,
      inviterEmail: inviter?.email || "Unknown",
    };
  },
});

// Get pending invitations for current user's email
export const getMyPendingInvitations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const user = await ctx.db.get(userId);
    if (!user || !user.email) {
      return [];
    }

    const email = user.email.toLowerCase();

    // Get all pending invitations for this email
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Enrich with group details
    const enrichedInvitations = await Promise.all(
      invitations.map(async (invitation) => {
        const group = await ctx.db.get(invitation.groupId);
        const inviter = await ctx.db.get(invitation.invitedBy);
        return {
          ...invitation,
          groupName: group?.name || "Unknown Group",
          inviterEmail: inviter?.email || "Unknown",
        };
      })
    );

    return enrichedInvitations;
  },
});
