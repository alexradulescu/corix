import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AuditLogEntry } from "./AuditLogEntry";

interface AuditLogListProps {
  groupId: Id<"groups">;
}

export function AuditLogList({ groupId }: AuditLogListProps) {
  const logs = useQuery(api.auditLogs.getGroupAuditLogs, { groupId });

  if (logs === undefined) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        Loading audit logs...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#666",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        No audit log entries yet.
      </div>
    );
  }

  return (
    <div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
            <th
              style={{
                textAlign: "left",
                padding: "0.75rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#374151",
                width: "200px",
              }}
            >
              Date & Time
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "0.75rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#374151",
                width: "180px",
              }}
            >
              Action
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "0.75rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#374151",
              }}
            >
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <AuditLogEntry key={log._id} log={log} />
          ))}
        </tbody>
      </table>

      {logs.length >= 100 && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            backgroundColor: "#fef3c7",
            color: "#92400e",
            fontSize: "0.875rem",
            borderRadius: "4px",
            border: "1px solid #fbbf24",
          }}
        >
          Showing the 100 most recent audit log entries.
        </div>
      )}
    </div>
  );
}
