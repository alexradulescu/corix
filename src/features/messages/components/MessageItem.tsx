import { Doc } from "../../../../convex/_generated/dataModel";

interface MessageItemProps {
  message: Doc<"messages"> & { authorDisplay: string };
}

export function MessageItem({ message }: MessageItemProps) {
  const formattedDate = new Date(message.createdAt).toLocaleString();
  const isDeletedUser = message.authorDisplay.startsWith("Deleted User");

  return (
    <div
      style={{
        padding: "1rem",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: "0.875rem",
            color: isDeletedUser ? "#9ca3af" : "#111827",
          }}
        >
          {message.authorDisplay}
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
          }}
        >
          {formattedDate}
        </span>
      </div>
      <div
        style={{
          color: "#374151",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
