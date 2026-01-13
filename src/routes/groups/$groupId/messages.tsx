import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/$groupId/messages")({
  component: GroupMessagesPage,
});

function GroupMessagesPage() {
  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Messages</h2>
      <p style={{ color: "#666" }}>
        Messaging functionality will be implemented in Phase 9.
      </p>
    </div>
  );
}
