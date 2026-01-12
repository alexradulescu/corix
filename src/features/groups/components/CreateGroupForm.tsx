import { useState, FormEvent } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../../../../convex/_generated/api";

export function CreateGroupForm() {
  const navigate = useNavigate();
  const createGroup = useMutation(api.groups.createGroup);

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Group name is required");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Group name must be less than 100 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const groupId = await createGroup({ name: trimmedName });
      navigate({ to: "/groups/$groupId", params: { groupId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label htmlFor="group-name" style={{ display: "block", marginBottom: "0.25rem" }}>
          Group Name
        </label>
        <input
          id="group-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name"
          maxLength={100}
          autoFocus
          required
        />
        <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>
          {name.length}/100 characters
        </p>
      </div>

      {error && (
        <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={!name.trim() || isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Group"}
      </button>
    </form>
  );
}
