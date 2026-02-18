import { useState, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { validateEmail } from "../../../shared/utils/validation";
import { useNotificationStore } from "../../../stores/notificationStore";

interface InviteFormProps {
  groupId: Id<"groups">;
  onSuccess?: () => void;
}

export function InviteForm({ groupId, onSuccess }: InviteFormProps) {
  const createInvitation = useMutation(api.invitations.createInvitation);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      await createInvitation({ groupId, email: trimmedEmail });
      addNotification(`Invitation sent to ${trimmedEmail}`, "success");
      setEmail("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label htmlFor="invite-email" style={{ display: "block", marginBottom: "0.25rem" }}>
          Email Address
        </label>
        <input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          autoFocus
          required
        />
        <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>
          Enter the email address of the person you want to invite
        </p>
      </div>

      {error && (
        <div style={{ color: "#dc2626", fontSize: "0.875rem", padding: "0.5rem", backgroundColor: "#fee", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={!email.trim() || isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Invitation"}
      </button>
    </form>
  );
}
