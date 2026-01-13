import { useState, FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";

export function ForgotPasswordForm() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn("password", {
        email,
        flow: "reset",
      });
      setSuccess(true);
    } catch (err) {
      // Always show success even if email doesn't exist (security best practice)
      setSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <h2>Check your email</h2>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          If an account exists with <strong>{email}</strong>, we've sent password reset instructions.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link to="/login">Return to login</Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ color: "#666", fontSize: "0.875rem" }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>

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

      {error && (
        <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} style={{ marginTop: "0.5rem" }}>
        {isSubmitting ? "Sending..." : "Send reset link"}
      </button>

      <p style={{ textAlign: "center", fontSize: "0.875rem" }}>
        <Link to="/login">Back to login</Link>
      </p>
    </form>
  );
}
