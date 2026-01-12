import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "../../../shared/components/Loading";
import { RoleSelector } from "./RoleSelector";
import { useState } from "react";

interface MemberListProps {
  groupId: Id<"groups">;
  currentUserRole: string;
  currentUserId: string;
}

export function MemberList({ groupId, currentUserRole, currentUserId }: MemberListProps) {
  const members = useQuery(api.groups.getMembers, { groupId });
  const leaveGroup = useMutation(api.memberships.leaveGroup);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  if (members === undefined) {
    return <Loading />;
  }

  const canManage = currentUserRole === "admin";
  const adminCount = members.filter((m) => m.role === "admin").length;

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    setLeaveError(null);
    setIsLeaving(true);

    try {
      await leaveGroup({ groupId });
    } catch (err) {
      setLeaveError(err instanceof Error ? err.message : "Failed to leave group");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>Members ({members.filter(m => m.role !== "removed").length})</h2>

        {currentUserRole !== "removed" && (
          <button
            onClick={handleLeave}
            disabled={isLeaving || (currentUserRole === "admin" && adminCount <= 1)}
            style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              fontSize: "0.875rem",
            }}
          >
            {isLeaving ? "Leaving..." : "Leave Group"}
          </button>
        )}
      </div>

      {leaveError && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "4px",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {leaveError}
        </div>
      )}

      {members.length === 0 ? (
        <p style={{ color: "#666" }}>No members found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            const isLastAdmin = member.role === "admin" && adminCount <= 1;

            return (
              <div
                key={member.membershipId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  backgroundColor: isCurrentUser ? "#f0f9ff" : "#f5f5f5",
                  borderRadius: "4px",
                  opacity: member.role === "removed" ? 0.6 : 1,
                  border: isCurrentUser ? "1px solid #bae6fd" : "none",
                }}
              >
                <div>
                  <span style={{ textDecoration: member.isDeleted ? "line-through" : "none" }}>
                    {member.email}
                  </span>
                  {isCurrentUser && (
                    <span style={{ color: "#0284c7", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                      (you)
                    </span>
                  )}
                  {member.isDeleted && (
                    <span style={{ color: "#dc2626", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                      (deleted)
                    </span>
                  )}
                </div>

                <RoleSelector
                  groupId={groupId}
                  userId={member.userId as Id<"users">}
                  currentRole={member.role}
                  canManage={canManage && !isCurrentUser}
                  isCurrentUser={isCurrentUser}
                  isLastAdmin={isLastAdmin}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
