import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  groupId: Id<"groups">;
}

export function MessageList({ groupId }: MessageListProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.getMessages,
    { groupId },
    { initialNumItems: 20 }
  );

  if (status === "LoadingFirstPage") {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        Loading messages...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        No messages yet. Be the first to post!
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {results.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
      </div>

      {status === "CanLoadMore" && (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          <button
            onClick={() => loadMore(20)}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
            }}
          >
            Load more messages
          </button>
        </div>
      )}

      {status === "LoadingMore" && (
        <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
          Loading more messages...
        </div>
      )}
    </div>
  );
}
