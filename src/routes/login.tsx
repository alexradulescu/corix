import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { LoginForm } from "../features/auth";
import { Loading } from "../shared/components/Loading";

type LoginSearch = {
  returnTo?: string;
};

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
    };
  },
});

function LoginPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/groups" />;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Sign in</h1>
      <LoginForm />
    </div>
  );
}
