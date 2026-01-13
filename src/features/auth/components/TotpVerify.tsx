import { useState, FormEvent } from "react";

interface TotpVerifyProps {
  onVerify: (code: string) => Promise<void>;
  onCancel?: () => void;
}

export function TotpVerify({ onVerify, onCancel }: TotpVerifyProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onVerify(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "1rem" }}>
      <h2 style={{ marginBottom: "0.5rem" }}>Two-Factor Authentication</h2>
      <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        Enter the 6-digit code from your authenticator app.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="totp-code" style={{ display: "block", marginBottom: "0.25rem" }}>
            Verification Code
          </label>
          <input
            id="totp-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            autoComplete="one-time-code"
            autoFocus
            style={{ textAlign: "center", letterSpacing: "0.5em", fontSize: "1.25rem" }}
          />
        </div>

        {error && (
          <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={code.length !== 6 || isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ backgroundColor: "transparent", color: "#666", border: "none" }}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
