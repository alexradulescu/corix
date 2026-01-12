import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/$groupId/invitations")({
  component: GroupInvitationsPage,
});

function GroupInvitationsPage() {
  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Pending Invitations</h2>
      <p style={{ color: "#666" }}>
        Invitation system will be implemented in Phase 8.
      </p>
    </div>
  );
}
