import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

  // Auto-accept when user is logged in
  useEffect(() => {
    if (invitation && invitation.status === "pending" && !isAccepting && !error) {
      handleAccept();
    }
  }, [invitation]);

  const handleAccept = async () => {
    setIsAccepting(true);
    setError(null);

    try {
      const result = await acceptInvitation({
        invitationId: invitationId as Id<"invitations">,
      });
      // Redirect to the group
      navigate({ to: "/groups/$groupId", params: { groupId: result.groupId } });
    } catch (err) {
      setIsAccepting(false);
      if (err instanceof Error) {
        // Check if error is due to not being logged in
        if (err.message.includes("Not authenticated") || err.message.includes("not for your email")) {
          setError(err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to accept invitation");
      }
    }
  };

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
          This invitation to join "{invitation.groupName}" has already been accepted.
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
          This invitation to join "{invitation.groupName}" has been revoked.
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link to="/login">
            <button>Go to login</button>
          </Link>
        </p>
      </div>
    );
  }

  // Error state (email mismatch or other errors)
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
                  window.location.href = `/invite/${invitationId}`;
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
          You're being added to "{invitation.groupName}"
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
          You've been invited to join
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
