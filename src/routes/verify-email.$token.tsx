import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loading } from "../shared/components/Loading";

export const Route = createFileRoute("/verify-email/$token")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useParams();
  const { signIn } = useAuthActions();
  const autoAcceptInvitations = useMutation(api.invitations.autoAcceptInvitations);
  const currentUser = useQuery(api.users.currentUser);

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        await signIn("password", {
          token,
          flow: "email-verification",
        });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Verification failed");
        }
      }
    }

    verify();
  }, [token, signIn]);

  // Auto-accept pending invitations after verification
  useEffect(() => {
    async function acceptInvitations() {
      if (status === "success" && currentUser?.email) {
        try {
          await autoAcceptInvitations({ email: currentUser.email });
        } catch (err) {
          console.error("Failed to auto-accept invitations:", err);
          // Don't show error to user, just log it
        }
      }
    }

    acceptInvitations();
  }, [status, currentUser, autoAcceptInvitations]);

  if (status === "verifying") {
    return (
      <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
        <h1>Verifying email...</h1>
        <Loading />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
        <h1>Verification failed</h1>
        <p style={{ marginTop: "1rem", color: "#dc2626" }}>
          {error || "This link may have expired or is invalid."}
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link to="/login">Return to login</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
      <h1>Email verified!</h1>
      <p style={{ marginTop: "1rem", color: "#666" }}>
        Your email has been verified. You can now log in to your account.
      </p>
      <p style={{ marginTop: "1.5rem" }}>
        <Link to="/login">
          <button>Continue to login</button>
        </Link>
      </p>
    </div>
  );
}
