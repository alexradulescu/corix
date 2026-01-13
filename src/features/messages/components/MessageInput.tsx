import { useState, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface MessageInputProps {
  groupId: Id<"groups">;
  onSuccess?: () => void;
}

export function MessageInput({ groupId, onSuccess }: MessageInputProps) {
  const createMessage = useMutation(api.messages.createMessage);

  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Message cannot be empty");
      return;
    }

    if (trimmedContent.length > 500) {
      setError("Message cannot exceed 500 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await createMessage({ groupId, content: trimmedContent });
      setContent("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (but not Shift+Enter for new lines)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "1rem",
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      {error && (
        <div
          style={{
            color: "#dc2626",
            fontSize: "0.875rem",
            padding: "0.5rem",
            backgroundColor: "#fee",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ position: "relative" }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          rows={3}
          maxLength={500}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            fontSize: "0.875rem",
            resize: "vertical",
            minHeight: "80px",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0.5rem",
            right: "0.5rem",
            fontSize: "0.75rem",
            color: content.length > 450 ? "#dc2626" : "#9ca3af",
          }}
        >
          {content.length}/500
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting || content.length > 500}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
          }}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
}
