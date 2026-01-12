import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "../../../shared/components/Loading";

export const Route = createFileRoute("/groups/$groupId/members")({
  component: GroupMembersPage,
});

function GroupMembersPage() {
  const { groupId } = Route.useParams();
  const members = useQuery(api.groups.getMembers, { groupId: groupId as Id<"groups"> });

  if (members === undefined) {
    return <Loading />;
  }

  const roleColors: Record<string, string> = {
    admin: "#16a34a",
    editor: "#2563eb",
    viewer: "#666",
    removed: "#dc2626",
  };

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Members ({members.length})</h2>

      {members.length === 0 ? (
        <p style={{ color: "#666" }}>No members found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {members.map((member) => (
            <div
              key={member.membershipId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1rem",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                opacity: member.role === "removed" ? 0.6 : 1,
              }}
            >
              <div>
                <span style={{ textDecoration: member.isDeleted ? "line-through" : "none" }}>
                  {member.email}
                </span>
                {member.isDeleted && (
                  <span style={{ color: "#dc2626", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                    (deleted)
                  </span>
                )}
              </div>
              <span
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  borderRadius: "4px",
                  backgroundColor: roleColors[member.role] + "20",
                  color: roleColors[member.role],
                  fontWeight: 500,
                }}
              >
                {member.role}
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ color: "#666", fontSize: "0.875rem", marginTop: "1.5rem" }}>
        Role management will be fully implemented in Phase 7.
      </p>
    </div>
  );
}
