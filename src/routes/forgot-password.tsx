import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { ForgotPasswordForm } from "../features/auth";
import { Loading } from "../shared/components/Loading";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/groups" />;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Forgot password</h1>
      <ForgotPasswordForm />
    </div>
  );
}
