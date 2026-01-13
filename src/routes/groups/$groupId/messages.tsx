import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MessageList, MessageInput } from "../../../features/messages";

export const Route = createFileRoute("/groups/$groupId/messages")({
  component: GroupMessagesPage,
});

function GroupMessagesPage() {
  const { groupId } = Route.useParams();
  const membership = useQuery(api.memberships.getMyMembership, { groupId });

  // Check if user can post messages (admin or editor)
  const canPost =
    membership?.role === "admin" || membership?.role === "editor";

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Messages</h2>

      {membership?.role === "removed" ? (
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
          You don't have access to view messages in this group.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {!canPost && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#fef3c7",
                color: "#92400e",
                fontSize: "0.875rem",
                borderRadius: "4px",
                border: "1px solid #fbbf24",
              }}
            >
              You can view messages but only admins and editors can post.
            </div>
          )}

          <MessageList groupId={groupId} />

          {canPost && <MessageInput groupId={groupId} />}
        </div>
      )}
    </div>
  );
}
