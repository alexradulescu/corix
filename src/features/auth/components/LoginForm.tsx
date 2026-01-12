import { useState, FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";

interface LoginFormProps {
  onNeedsTwoFactor?: () => void;
}

export function LoginForm({ onNeedsTwoFactor }: LoginFormProps) {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { returnTo?: string };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("password", {
        email,
        password,
        flow: "signIn",
      });

      // Check if 2FA is required (will be implemented in Phase 5)
      if (result && typeof result === "object" && "needsTwoFactor" in result) {
        onNeedsTwoFactor?.();
        return;
      }

      // Redirect to the return URL or groups
      const returnTo = search.returnTo || "/groups";
      navigate({ to: returnTo });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("email not verified")) {
          setError("Please verify your email before logging in");
        } else if (err.message.includes("Invalid")) {
          setError("Invalid email or password");
        } else {
          setError(err.message);
        }
      } else {
        setError("Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} style={{ marginTop: "0.5rem" }}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register">Create account</Link>
      </div>
    </form>
  );
}
