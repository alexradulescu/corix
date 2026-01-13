import { Doc } from "../../../../convex/_generated/dataModel";

interface AuditLogEntryProps {
  log: Doc<"auditLogs"> & {
    actorEmail: string;
    targetEmail: string | null;
  };
}

function formatActionType(action: string): string {
  const actionMap: Record<string, string> = {
    member_invited: "Member Invited",
    member_joined: "Member Joined",
    member_left: "Member Left",
    member_removed: "Member Removed",
    role_changed: "Role Changed",
    invite_revoked: "Invitation Revoked",
    group_soft_deleted: "Group Soft Deleted",
    group_restored: "Group Restored",
  };

  return actionMap[action] || action;
}

function formatActionDescription(log: AuditLogEntryProps["log"]): string {
  const details = log.details ? JSON.parse(log.details) : {};

  switch (log.action) {
    case "member_invited":
      return `invited ${details.email}`;

    case "member_joined":
      return `joined the group${details.viaInvite ? " via invitation" : ""}`;

    case "member_left":
      return `left the group (was ${details.previousRole})`;

    case "member_removed":
      return `removed ${log.targetEmail || "a member"} (was ${details.previousRole})`;

    case "role_changed":
      return `changed ${log.targetEmail || "a member"}'s role from ${details.previousRole} to ${details.newRole}`;

    case "invite_revoked":
      return `revoked invitation for ${details.email}`;

    case "group_soft_deleted":
      return `soft deleted the group`;

    case "group_restored":
      return `restored the group`;

    default:
      return log.action;
  }
}

export function AuditLogEntry({ log }: AuditLogEntryProps) {
  const formattedDate = new Date(log.createdAt).toLocaleString();
  const actionType = formatActionType(log.action);
  const description = formatActionDescription(log);

  return (
    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
      <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
        {formattedDate}
      </td>
      <td style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
        {actionType}
      </td>
      <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
        <span style={{ color: "#374151" }}>
          {log.actorEmail}
        </span>
        {" "}
        <span style={{ color: "#6b7280" }}>
          {description}
        </span>
      </td>
    </tr>
  );
}
