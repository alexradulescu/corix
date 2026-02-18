import { createFileRoute } from "@tanstack/react-router";
import { Id } from "../../../../convex/_generated/dataModel";
import { AuditLogList } from "../../../features/audit";
import { GroupRoleGuard } from "../../../shared/components/GroupRoleGuard";

export const Route = createFileRoute("/groups/$groupId/audit")({
  component: GroupAuditPage,
});

function GroupAuditPage() {
  const { groupId } = Route.useParams();

  return (
    // GroupRoleGuard ensures only admins can view audit logs,
    // mirroring the backend permission check with a clear UX message for others.
    <GroupRoleGuard
      groupId={groupId as Id<"groups">}
      requiredRoles={["admin"]}
    >
      <div>
        <h2 style={{ marginBottom: "1rem" }}>Audit Log</h2>

        <p style={{ color: "#666", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Track all membership changes, invitations, and role updates in this group.
        </p>

        <AuditLogList groupId={groupId as Id<"groups">} />
      </div>
    </GroupRoleGuard>
  );
}
