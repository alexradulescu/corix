import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { ResetPasswordForm } from "../features/auth";
import { Loading } from "../shared/components/Loading";

export const Route = createFileRoute("/reset-password/$token")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useParams();
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/groups" />;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Reset password</h1>
      <ResetPasswordForm token={token} />
    </div>
  );
}
