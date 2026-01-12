import { useState, FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { validatePassword } from "../utils/passwordValidation";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      const { errors } = validatePassword(value);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password
    const { valid, errors } = validatePassword(password);
    if (!valid) {
      setPasswordErrors(errors);
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn("password", {
        token,
        newPassword: password,
        flow: "reset-verification",
      });
      setSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("expired") || err.message.includes("invalid")) {
          setError("This reset link has expired or is invalid. Please request a new one.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to reset password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <h2>Password reset successful</h2>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Your password has been updated. Redirecting to login...
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link to="/login">Click here if not redirected</Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ color: "#666", fontSize: "0.875rem" }}>
        Enter your new password below.
      </p>

      <div>
        <label htmlFor="password" style={{ display: "block", marginBottom: "0.25rem" }}>
          New Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="At least 12 characters"
        />
        {passwordErrors.length > 0 && (
          <ul style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
            {passwordErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "0.25rem" }}>
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Re-enter your password"
        />
      </div>

      {error && (
        <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} style={{ marginTop: "0.5rem" }}>
        {isSubmitting ? "Resetting..." : "Reset password"}
      </button>

      <p style={{ textAlign: "center", fontSize: "0.875rem" }}>
        <Link to="/login">Back to login</Link>
      </p>
    </form>
  );
}
