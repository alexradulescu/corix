import { createFileRoute } from "@tanstack/react-router";
import { Id } from "../../../../convex/_generated/dataModel";
import { InviteForm, PendingInvitationsList } from "../../../features/members";
import { GroupRoleGuard } from "../../../shared/components/GroupRoleGuard";

export const Route = createFileRoute("/groups/$groupId/invitations")({
  component: GroupInvitationsPage,
});

function GroupInvitationsPage() {
  const { groupId } = Route.useParams();

  return (
    // GroupRoleGuard provides a clear permission-denied message for non-admins
    // instead of silently rendering an empty/broken page.
    <GroupRoleGuard
      groupId={groupId as Id<"groups">}
      requiredRoles={["admin"]}
    >
      <div>
        <h2 style={{ marginBottom: "1rem" }}>Invite Members</h2>

        <div style={{
          backgroundColor: "#f9fafb",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          border: "1px solid #e5e7eb",
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1rem" }}>Send an Invitation</h3>
          <InviteForm groupId={groupId as Id<"groups">} />
        </div>

        <h2 style={{ marginBottom: "1rem" }}>Pending Invitations</h2>
        <PendingInvitationsList groupId={groupId as Id<"groups">} />
      </div>
    </GroupRoleGuard>
  );
}
