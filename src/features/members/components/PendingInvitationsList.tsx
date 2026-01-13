import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";

interface PendingInvitationsListProps {
  groupId: Id<"groups">;
}

export function PendingInvitationsList({ groupId }: PendingInvitationsListProps) {
  const invitations = useQuery(api.invitations.getPendingInvitations, { groupId });
  const revokeInvitation = useMutation(api.invitations.revokeInvitation);

  const [revokingId, setRevokingId] = useState<Id<"invitations"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async (invitationId: Id<"invitations">) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) {
      return;
    }

    setError(null);
    setRevokingId(invitationId);

    try {
      await revokeInvitation({ invitationId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke invitation");
    } finally {
      setRevokingId(null);
    }
  };

  if (invitations === undefined) {
    return <div>Loading invitations...</div>;
  }

  if (invitations.length === 0) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
        No pending invitations
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ color: "#dc2626", fontSize: "0.875rem", padding: "0.5rem", backgroundColor: "#fee", borderRadius: "4px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
            <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600 }}>Email</th>
            <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600 }}>Invited By</th>
            <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600 }}>Date</th>
            <th style={{ textAlign: "right", padding: "0.75rem", fontWeight: 600 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((invitation) => (
            <tr key={invitation._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "0.75rem" }}>{invitation.email}</td>
              <td style={{ padding: "0.75rem" }}>{invitation.inviterEmail}</td>
              <td style={{ padding: "0.75rem" }}>
                {new Date(invitation.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: "0.75rem", textAlign: "right" }}>
                <button
                  onClick={() => handleRevoke(invitation._id)}
                  disabled={revokingId === invitation._id}
                  style={{
                    padding: "0.25rem 0.75rem",
                    fontSize: "0.875rem",
                    color: "#dc2626",
                    backgroundColor: "transparent",
                    border: "1px solid #dc2626",
                    borderRadius: "4px",
                    cursor: revokingId === invitation._id ? "not-allowed" : "pointer",
                    opacity: revokingId === invitation._id ? 0.5 : 1,
                  }}
                >
                  {revokingId === invitation._id ? "Revoking..." : "Revoke"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
