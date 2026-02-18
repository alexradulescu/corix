import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Loading } from "../shared/components/Loading";
import { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/invite/$invitationId")({
  component: InviteAcceptancePage,
});

function InviteAcceptancePage() {
  const { invitationId } = Route.useParams();
  const navigate = useNavigate();
  const { signOut } = useAuthActions();
  const acceptInvitation = useMutation(api.invitations.acceptInvitation);

  const invitation = useQuery(
    api.invitations.getInvitation,
    { invitationId: invitationId as Id<"invitations"> }
  );

  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = useCallback(async () => {
    setIsAccepting(true);
    setError(null);

    try {
      const result = await acceptInvitation({
        invitationId: invitationId as Id<"invitations">,
      });
      navigate({ to: "/groups/$groupId", params: { groupId: result.groupId } });
    } catch (err) {
      setIsAccepting(false);
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
    }
  }, [acceptInvitation, invitationId, navigate]);

  // Auto-accept when user is logged in and the invitation is pending
  useEffect(() => {
    if (invitation && invitation.status === "pending" && !isAccepting && !error) {
      handleAccept();
    }
  }, [invitation, isAccepting, error, handleAccept]);

  // Loading state
  if (invitation === undefined) {
    return (
      <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
        <h1>Loading invitation...</h1>
        <Loading />
      </div>
    );
  }

  // Invitation not found
  if (!invitation) {
    return (
      <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
        <h1>Invitation not found</h1>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          This invitation link is invalid or has been removed.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link to="/login">
            <button>Go to login</button>
          </Link>
        </p>
      </div>
    );
  }

  // Invitation already accepted
  if (invitation.status === "accepted") {
    return (
      <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
        <h1>Invitation already accepted</h1>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          This invitation to join &ldquo;{invitation.groupName}&rdquo; has already been accepted.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link to="/groups">
            <button>Go to my groups</button>
          </Link>
        </p>
      </div>
    );
  }

  // Invitation revoked
  if (invitation.status === "revoked") {
    return (
      <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
        <h1>Invitation revoked</h1>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          This invitation to join &ldquo;{invitation.groupName}&rdquo; has been revoked.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link to="/login">
            <button>Go to login</button>
          </Link>
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    const isAuthError = error.includes("Not authenticated");
    const isEmailMismatch = error.includes("not for your email");

    return (
      <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
        <h1>Cannot accept invitation</h1>
        <div style={{
          backgroundColor: "#fee",
          color: "#dc2626",
          padding: "1rem",
          borderRadius: "8px",
          marginTop: "1rem"
        }}>
          {error}
        </div>

        {isAuthError && (
          <div style={{ marginTop: "1.5rem" }}>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              This invitation is for: <strong>{invitation.email}</strong>
            </p>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              Please log in or register with this email address to accept the invitation.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
              <Link to="/login" search={{ returnTo: `/invite/${invitationId}` }}>
                <button>Log in</button>
              </Link>
              <Link to="/register" search={{ returnTo: `/invite/${invitationId}` }}>
                <button>Register</button>
              </Link>
            </div>
          </div>
        )}

        {isEmailMismatch && (
          <div style={{ marginTop: "1.5rem" }}>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              This invitation is for: <strong>{invitation.email}</strong>
            </p>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              You are currently logged in with a different email address.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
              <button
                onClick={async () => {
                  await signOut();
                  // Use navigate so the router handles the transition instead of a full reload
                  navigate({ to: "/invite/$invitationId", params: { invitationId } });
                }}
              >
                Log out and try again
              </button>
            </div>
          </div>
        )}

        {!isAuthError && !isEmailMismatch && (
          <p style={{ marginTop: "1.5rem" }}>
            <Link to="/groups">
              <button>Go to my groups</button>
            </Link>
          </p>
        )}
      </div>
    );
  }

  // Accepting state
  if (isAccepting) {
    return (
      <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
        <h1>Accepting invitation...</h1>
        <Loading />
        <p style={{ marginTop: "1rem", color: "#666" }}>
          You&rsquo;re being added to &ldquo;{invitation.groupName}&rdquo;
        </p>
      </div>
    );
  }

  // Default: Show invitation details and accept button
  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
      <h1>Group Invitation</h1>
      <div style={{
        backgroundColor: "#f9fafb",
        padding: "1.5rem",
        borderRadius: "8px",
        marginTop: "1.5rem",
        border: "1px solid #e5e7eb"
      }}>
        <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
          You&rsquo;ve been invited to join
        </p>
        <h2 style={{ margin: "0.5rem 0", fontSize: "1.5rem" }}>
          {invitation.groupName}
        </h2>
        <p style={{ color: "#666", fontSize: "0.875rem", marginTop: "1rem" }}>
          Invited by: {invitation.inviterEmail}
        </p>
        <p style={{ color: "#666", fontSize: "0.875rem" }}>
          Invitation for: {invitation.email}
        </p>
      </div>

      <button
        onClick={handleAccept}
        disabled={isAccepting}
        style={{ marginTop: "1.5rem", width: "100%", maxWidth: "200px" }}
      >
        Accept Invitation
      </button>

      <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#666" }}>
        <Link to="/groups">Go to my groups</Link>
      </p>
    </div>
  );
}
