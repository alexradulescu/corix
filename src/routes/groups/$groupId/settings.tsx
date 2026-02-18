import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "../../../shared/components/Loading";
import { GroupRoleGuard } from "../../../shared/components/GroupRoleGuard";

export const Route = createFileRoute("/groups/$groupId/settings")({
  component: GroupSettingsPage,
});

function GroupSettingsPage() {
  const { groupId } = Route.useParams();
  const navigate = useNavigate();
  const group = useQuery(api.groups.getGroup, { groupId: groupId as Id<"groups"> });
  const updateGroup = useMutation(api.groups.updateGroup);
  const softDeleteGroup = useMutation(api.groups.softDeleteGroup);

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (deleteConfirmText !== group?.name) {
      return;
    }

    setIsDeleting(true);

    try {
      await softDeleteGroup({ groupId: groupId as Id<"groups"> });
      navigate({ to: "/groups" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <GroupRoleGuard
      groupId={groupId as Id<"groups">}
      requiredRoles={["admin"]}
    >
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
          Soft deleting this group will archive it and remove all members. All data will be preserved but the group will be inaccessible. Only super-admins can restore soft-deleted groups.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ backgroundColor: "#dc2626", color: "#fff" }}
          >
            Soft Delete Group
          </button>
        ) : (
          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "#fee",
              border: "2px solid #dc2626",
              borderRadius: "8px",
              maxWidth: "500px",
            }}
          >
            <h4 style={{ margin: "0 0 1rem 0", color: "#dc2626" }}>
              Confirm Group Deletion
            </h4>
            <p style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
              This action will soft delete the group "<strong>{group.name}</strong>". All members will be removed and the group will be archived.
            </p>
            <p style={{ marginBottom: "1rem", fontSize: "0.875rem", fontWeight: 600 }}>
              Type the group name to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={group.name}
              style={{ width: "100%", marginBottom: "1rem" }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== group.name || isDeleting}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  opacity: deleteConfirmText !== group.name || isDeleting ? 0.5 : 1,
                }}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                disabled={isDeleting}
                style={{ backgroundColor: "#6b7280", color: "#fff" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
    </GroupRoleGuard>
  );
}
