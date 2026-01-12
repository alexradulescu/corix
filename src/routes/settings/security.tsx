import { createFileRoute } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loading } from "../../shared/components/Loading";
import { PasswordConfirmDialog } from "../../shared/components/PasswordConfirmDialog";
import { validatePassword } from "../../features/auth/utils/passwordValidation";

export const Route = createFileRoute("/settings/security")({
  component: SettingsSecurityPage,
});

function SettingsSecurityPage() {
  const user = useQuery(api.users.currentUser);
  const changePassword = useMutation(api.users.changePassword);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (user === undefined) {
    return <Loading />;
  }

  if (user === null) {
    return <div>Not authenticated</div>;
  }

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (value) {
      const { errors } = validatePassword(value);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handlePasswordChangeConfirm = async (currentPassword: string) => {
    // Validate new password
    const { valid, errors } = validatePassword(newPassword);
    if (!valid) {
      throw new Error(errors[0]);
    }

    // Check passwords match
    if (newPassword !== confirmNewPassword) {
      throw new Error("New passwords do not match");
    }

    await changePassword({
      currentPassword,
      newPassword,
    });

    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordErrors([]);
    setSuccessMessage("Password changed successfully");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Security</h2>

      {successMessage && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#dcfce7",
            color: "#16a34a",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          {successMessage}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Password Change Section */}
        <section>
          <h3 style={{ marginBottom: "1rem" }}>Change Password</h3>

          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              const { valid } = validatePassword(newPassword);
              if (!valid) return;
              if (newPassword !== confirmNewPassword) {
                setPasswordErrors(["Passwords do not match"]);
                return;
              }
              setShowPasswordChange(true);
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}
          >
            <div>
              <label htmlFor="new-password" style={{ display: "block", marginBottom: "0.25rem" }}>
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 12 characters"
              />
              {passwordErrors.length > 0 && (
                <ul
                  style={{
                    color: "#dc2626",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                    paddingLeft: "1.25rem",
                  }}
                >
                  {passwordErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirm-new-password" style={{ display: "block", marginBottom: "0.25rem" }}>
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter new password"
              />
            </div>

            <button
              type="submit"
              disabled={!newPassword || !confirmNewPassword || passwordErrors.length > 0}
              style={{ alignSelf: "flex-start" }}
            >
              Change Password
            </button>
          </form>
        </section>

        {/* 2FA Section */}
        <section>
          <h3 style={{ marginBottom: "1rem" }}>Two-Factor Authentication</h3>

          <div style={{ padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
            <p>
              Status:{" "}
              {user.totpEnabled ? (
                <span style={{ color: "#16a34a", fontWeight: "500" }}>Enabled</span>
              ) : (
                <span style={{ color: "#666" }}>Not enabled</span>
              )}
            </p>
            <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.5rem" }}>
              Two-factor authentication adds an extra layer of security to your account.
              This feature will be fully implemented in Phase 5.
            </p>
          </div>
        </section>
      </div>

      <PasswordConfirmDialog
        isOpen={showPasswordChange}
        onClose={() => setShowPasswordChange(false)}
        onConfirm={handlePasswordChangeConfirm}
        title="Confirm password change"
        description="Enter your current password to confirm the password change."
      />
    </div>
  );
}
