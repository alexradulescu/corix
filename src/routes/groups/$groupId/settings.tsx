import { createFileRoute } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "../../../shared/components/Loading";

export const Route = createFileRoute("/groups/$groupId/settings")({
  component: GroupSettingsPage,
});

function GroupSettingsPage() {
  const { groupId } = Route.useParams();
  const group = useQuery(api.groups.getGroup, { groupId: groupId as Id<"groups"> });
  const updateGroup = useMutation(api.groups.updateGroup);

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (group === undefined) {
    return <Loading />;
  }

  if (group === null) {
    return <div>Group not found</div>;
  }

  // Initialize the form with the group name
  if (!initialized && group) {
    setName(group.name);
    setInitialized(true);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Group name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateGroup({
        groupId: groupId as Id<"groups">,
        name: trimmedName,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Group Settings</h2>

      {success && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#dcfce7",
            color: "#16a34a",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          Settings saved successfully
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
        <div>
          <label htmlFor="group-name" style={{ display: "block", marginBottom: "0.25rem" }}>
            Group Name
          </label>
          <input
            id="group-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        {error && (
          <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={isSubmitting || name === group.name} style={{ alignSelf: "flex-start" }}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <hr style={{ margin: "2rem 0", border: "none", borderTop: "1px solid #ddd" }} />

      <section>
        <h3 style={{ marginBottom: "1rem", color: "#dc2626" }}>Danger Zone</h3>
        <p style={{ color: "#666", fontSize: "0.875rem", marginBottom: "1rem" }}>
          Group deletion will be implemented in Phase 11.
        </p>
        <button disabled style={{ backgroundColor: "#dc2626", opacity: 0.5 }}>
          Delete Group
        </button>
      </section>
    </div>
  );
}
