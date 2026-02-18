import { useState, FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { validatePassword, getPasswordStrength } from "../utils/passwordValidation";
import styles from "./auth.module.css";

const strengthConfig = {
  weak:   { color: "#dc2626", width: "33%",  label: "Weak"   },
  fair:   { color: "#d97706", width: "66%",  label: "Fair"   },
  strong: { color: "#16a34a", width: "100%", label: "Strong" },
} as const;
import { GoogleOAuthButton } from "./GoogleOAuthButton";

export function RegisterForm() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [strength, setStrength] = useState<"weak" | "fair" | "strong" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      const { errors } = validatePassword(value);
      setPasswordErrors(errors);
      setStrength(getPasswordStrength(value));
    } else {
      setPasswordErrors([]);
      setStrength(null);
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
    <div className={styles.container}>
      <GoogleOAuthButton mode="signup" />

      <div className={styles.divider}>
        <hr />
        or
        <hr />
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
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

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="At least 12 characters"
          />
          {password && strength && (
            <div style={{ marginTop: "0.375rem" }}>
              <div style={{ height: "4px", borderRadius: "2px", backgroundColor: "#e5e7eb" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: "2px",
                    width: strengthConfig[strength].width,
                    backgroundColor: strengthConfig[strength].color,
                    transition: "width 0.2s, background-color 0.2s",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.75rem", color: strengthConfig[strength].color }}>
                {strengthConfig[strength].label}
              </span>
            </div>
          )}
          {passwordErrors.length > 0 && (
            <ul style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
              {passwordErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword">Confirm Password</label>
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

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p style={{ textAlign: "center", color: "#666", fontSize: "0.875rem" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
