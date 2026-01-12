import { useState, FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { validatePassword } from "../utils/passwordValidation";
import { GoogleOAuthButton } from "./GoogleOAuthButton";

export function RegisterForm() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
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
        email,
        password,
        flow: "signUp",
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <h2>Check your email</h2>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          We've sent a verification link to <strong>{email}</strong>.
          Please click the link to verify your account.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link to="/login">Return to login</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <GoogleOAuthButton mode="signup" />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          color: "#666",
          fontSize: "0.875rem",
        }}
      >
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ddd" }} />
        or
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ddd" }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: "0.25rem" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: "block", marginBottom: "0.25rem" }}>
            Password
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
            Confirm Password
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p style={{ textAlign: "center", color: "#666", fontSize: "0.875rem" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
