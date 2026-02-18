import { useState, useEffect, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import QRCode from "qrcode";

interface TotpSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function TotpSetup({ onComplete, onCancel }: TotpSetupProps) {
  const generateTotpSecret = useMutation(api.users.generateTotpSecret);
  const enableTotp = useMutation(api.users.enableTotp);

  const [step, setStep] = useState<"generate" | "verify">("generate");
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateSecret = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await generateTotpSecret();
      setSecret(result.secret);

      // Use the canonical OTP URI returned by the backend (avoids duplication)
      const qrUrl = await QRCode.toDataURL(result.uri);
      setQrCodeUrl(qrUrl);

      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate secret");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!secret) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await enableTotp({
        secret,
        code: verificationCode,
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (step === "generate") {
      handleGenerateSecret();
    }
  }, []);

  if (step === "generate" || !qrCodeUrl) {
    return (
      <div style={{ textAlign: "center" }}>
        <h3>Setting up Two-Factor Authentication</h3>
        <p style={{ color: "#666", marginTop: "1rem" }}>
          {isSubmitting ? "Generating secret..." : "Please wait..."}
        </p>
        {error && (
          <div style={{ color: "#dc2626", marginTop: "1rem" }}>
            {error}
            <button onClick={handleGenerateSecret} style={{ marginLeft: "1rem" }}>
              Try again
            </button>
          </div>
        )}
        <button onClick={onCancel} style={{ marginTop: "1rem", backgroundColor: "#e5e5e5", color: "#333" }}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: "1rem" }}>Scan QR Code</h3>

      <p style={{ color: "#666", marginBottom: "1rem", fontSize: "0.875rem" }}>
        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
        <img src={qrCodeUrl} alt="TOTP QR Code" style={{ border: "1px solid #ddd", borderRadius: "8px" }} />
      </div>

      <details style={{ marginBottom: "1.5rem" }}>
        <summary style={{ cursor: "pointer", color: "#666", fontSize: "0.875rem" }}>
          Can't scan? Enter code manually
        </summary>
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          {secret}
        </div>
      </details>

      <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="verification-code" style={{ display: "block", marginBottom: "0.25rem" }}>
            Enter 6-digit code from your app
          </label>
          <input
            id="verification-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            autoComplete="one-time-code"
            style={{ textAlign: "center", letterSpacing: "0.5em", fontSize: "1.25rem" }}
          />
        </div>

        {error && (
          <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} style={{ backgroundColor: "#e5e5e5", color: "#333" }}>
            Cancel
          </button>
          <button type="submit" disabled={verificationCode.length !== 6 || isSubmitting}>
            {isSubmitting ? "Verifying..." : "Enable 2FA"}
          </button>
        </div>
      </form>
    </div>
  );
}
