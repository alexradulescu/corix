import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loading } from "../../shared/components/Loading";
import { TotpSetup } from "../../features/auth/components/TotpSetup";

export const Route = createFileRoute("/settings/security")({
  component: SettingsSecurityPage,
});

function SettingsSecurityPage() {
  const user = useQuery(api.users.currentUser);
  const disableTotp = useMutation(api.users.disableTotp);

  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [showDisableTotp, setShowDisableTotp] = useState(false);
  const [disableTotpCode, setDisableTotpCode] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [totpError, setTotpError] = useState<string | null>(null);

  if (user === undefined) {
    return <Loading />;
  }

  if (user === null) {
    return <div>Not authenticated</div>;
  }

  const handleDisableTotp = async (e: FormEvent) => {
    e.preventDefault();
    setTotpError(null);

    try {
      await disableTotp({ code: disableTotpCode });
      setShowDisableTotp(false);
      setDisableTotpCode("");
      setSuccessMessage("Two-factor authentication disabled");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setTotpError(err instanceof Error ? err.message : "Failed to disable 2FA");
    }
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
          <div style={{ padding: "1rem", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "1rem" }}>
              To change your password, please use the password reset flow for security reasons.
            </p>
            <Link
              to="/forgot-password"
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                backgroundColor: "#007bff",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontSize: "0.875rem",
              }}
            >
              Reset Password
            </Link>
          </div>
        </section>

        {/* 2FA Section */}
        <section>
          <h3 style={{ marginBottom: "1rem" }}>Two-Factor Authentication</h3>

          {showTotpSetup ? (
            <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
              <TotpSetup
                onComplete={() => {
                  setShowTotpSetup(false);
                  setSuccessMessage("Two-factor authentication enabled successfully");
                  setTimeout(() => setSuccessMessage(null), 3000);
                }}
                onCancel={() => setShowTotpSetup(false)}
              />
            </div>
          ) : showDisableTotp ? (
            <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
              <h4 style={{ marginBottom: "0.5rem" }}>Disable Two-Factor Authentication</h4>
              <p style={{ color: "#666", fontSize: "0.875rem", marginBottom: "1rem" }}>
                Enter your current 2FA code to disable two-factor authentication.
              </p>

              <form onSubmit={handleDisableTotp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label htmlFor="disable-totp-code" style={{ display: "block", marginBottom: "0.25rem" }}>
                    Verification Code
                  </label>
                  <input
                    id="disable-totp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={disableTotpCode}
                    onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    style={{ textAlign: "center", letterSpacing: "0.5em", fontSize: "1.25rem", maxWidth: "200px" }}
                  />
                </div>

                {totpError && (
                  <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>
                    {totpError}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisableTotp(false);
                      setDisableTotpCode("");
                      setTotpError(null);
                    }}
                    style={{ backgroundColor: "#e5e5e5", color: "#333" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disableTotpCode.length !== 6}
                    style={{ backgroundColor: "#dc2626" }}
                  >
                    Disable 2FA
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{ padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
              <p style={{ marginBottom: "1rem" }}>
                Status:{" "}
                {user.totpEnabled ? (
                  <span style={{ color: "#16a34a", fontWeight: "500" }}>Enabled</span>
                ) : (
                  <span style={{ color: "#666" }}>Not enabled</span>
                )}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "1rem" }}>
                Two-factor authentication adds an extra layer of security to your account by requiring a code from your authenticator app in addition to your password.
              </p>

              {user.totpEnabled ? (
                <button
                  onClick={() => setShowDisableTotp(true)}
                  style={{ backgroundColor: "#dc2626" }}
                >
                  Disable 2FA
                </button>
              ) : (
                <button onClick={() => setShowTotpSetup(true)}>
                  Enable 2FA
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
