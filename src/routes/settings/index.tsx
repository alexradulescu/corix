import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loading } from "../../shared/components/Loading";

export const Route = createFileRoute("/settings/")({
  component: SettingsProfilePage,
});

function SettingsProfilePage() {
  const user = useQuery(api.users.currentUser);

  if (user === undefined) {
    return <Loading />;
  }

  if (user === null) {
    return <div>Not authenticated</div>;
  }

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
    </div>
  );
}
