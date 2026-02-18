import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { Loading } from "../../shared/components/Loading";
import { PasswordConfirmDialog } from "../../shared/components/PasswordConfirmDialog";

export const Route = createFileRoute("/settings/")({
  component: SettingsProfilePage,
});

function SettingsProfilePage() {
  const navigate = useNavigate();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);
  const canDeleteAccount = useQuery(api.users.canDeleteAccount);
  const deleteAccount = useMutation(api.users.deleteAccount);

  // PasswordConfirmDialog is the first gate before the destructive "type DELETE" step.
  // Note: the password cannot be verified server-side with Convex Auth — this is
  // a conscious UX friction layer that makes users slow down before an irreversible action.
  const [showPasswordGate, setShowPasswordGate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user === undefined) {
    return <Loading />;
  }

  if (user === null) {
    return <div>Not authenticated</div>;
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteAccount({});
      await signOut();
      navigate({ to: "/login" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Profile</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
            Email
          </label>
          <div style={{ padding: "0.5rem", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
            {user.email || "No email set"}
          </div>
          <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>
            Email cannot be changed through this interface.
          </p>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
            Email Verified
          </label>
          <div style={{ padding: "0.5rem", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
            {user.emailVerificationTime ? (
              <span style={{ color: "#16a34a" }}>Verified</span>
            ) : (
              <span style={{ color: "#dc2626" }}>Not verified</span>
            )}
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
            Two-Factor Authentication
          </label>
          <div style={{ padding: "0.5rem", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
            {user.totpEnabled ? (
              <span style={{ color: "#16a34a" }}>Enabled</span>
            ) : (
              <span style={{ color: "#666" }}>Not enabled</span>
            )}
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
            Account Created
          </label>
          <div style={{ padding: "0.5rem", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "Unknown"}
          </div>
        </div>

        {user.isSuperAdmin && (
          <div>
            <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
              Role
            </label>
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "#fef3c7",
                borderRadius: "4px",
                color: "#92400e",
              }}
            >
              Super Admin
            </div>
          </div>
        )}
      </div>

      <hr style={{ margin: "2rem 0", border: "none", borderTop: "1px solid #ddd" }} />

      <section>
        <h3 style={{ marginBottom: "1rem", color: "#dc2626" }}>Delete Account</h3>

        {canDeleteAccount && !canDeleteAccount.canDelete && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#fee",
              border: "1px solid #dc2626",
              borderRadius: "8px",
              marginBottom: "1rem",
              color: "#dc2626",
            }}
          >
            <strong>Cannot delete account:</strong> {canDeleteAccount.reason}
          </div>
        )}

        <p style={{ color: "#666", fontSize: "0.875rem", marginBottom: "1rem" }}>
          Deleting your account will permanently remove your profile and anonymize your messages.
          This action cannot be undone.
        </p>

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
            Before deleting your account:
          </h4>
          <ul style={{ marginLeft: "1.25rem", fontSize: "0.875rem", color: "#666" }}>
            <li>Leave all groups where you are not the sole admin</li>
            <li>Promote another member to admin in groups where you are the sole admin</li>
            <li>Your messages will remain but will show as "Deleted User"</li>
            <li>All personal information will be permanently removed</li>
          </ul>
        </div>

        {/* Step 1: password gate dialog */}
        <PasswordConfirmDialog
          isOpen={showPasswordGate}
          title="Confirm before deleting"
          description="Enter your password to proceed to the deletion confirmation step. This does not delete your account yet."
          onClose={() => setShowPasswordGate(false)}
          onConfirm={async () => {
            // Password is used as UX friction only — not verified server-side.
            // After this gate the user must also type DELETE in the next step.
            setShowDeleteConfirm(true);
          }}
        />

        {!showPasswordGate && !showDeleteConfirm ? (
          <button
            onClick={() => setShowPasswordGate(true)}
            disabled={!canDeleteAccount?.canDelete}
            style={{
              backgroundColor: "#dc2626",
              color: "#fff",
              opacity: !canDeleteAccount?.canDelete ? 0.5 : 1,
            }}
          >
            Delete My Account
          </button>
        ) : showDeleteConfirm ? (
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
              Confirm Account Deletion
            </h4>
            <p style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
              This action will permanently delete your account and anonymize all your messages.
              <strong> This cannot be undone.</strong>
            </p>

            {error && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#fee",
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                  border: "1px solid #dc2626",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="delete-confirm"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                Type DELETE to confirm:
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                style={{ width: "100%" }}
                disabled={isDeleting}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  opacity: deleteConfirmText !== "DELETE" || isDeleting ? 0.5 : 1,
                }}
              >
                {isDeleting ? "Deleting..." : "Permanently Delete Account"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowPasswordGate(false);
                  setDeleteConfirmText("");
                  setError(null);
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
  );
}
