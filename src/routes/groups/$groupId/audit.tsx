import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/$groupId/audit")({
  component: GroupAuditPage,
});

function GroupAuditPage() {
  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Audit Log</h2>
      <p style={{ color: "#666" }}>
        Audit logging will be implemented in Phase 10.
      </p>
    </div>
  );
}
