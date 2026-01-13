import { createFileRoute } from "@tanstack/react-router";
import { AuditLogList } from "../../../features/audit";

export const Route = createFileRoute("/groups/$groupId/audit")({
  component: GroupAuditPage,
});

function GroupAuditPage() {
  const { groupId } = Route.useParams();

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Audit Log</h2>

      <p style={{ color: "#666", marginBottom: "1rem", fontSize: "0.875rem" }}>
        Track all membership changes, invitations, and role updates in this group.
        Only admins can view the audit log.
      </p>

      <AuditLogList groupId={groupId} />
    </div>
  );
}
