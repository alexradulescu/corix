import { ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import { Loading } from "./Loading";
import { LoginForm } from "../../features/auth";

interface ProtectedWithLoginProps {
  children: ReactNode;
}

/**
 * Shows an inline login form when the user is not authenticated,
 * rather than redirecting away from the current page.
 *
 * Use this for pages that benefit from keeping the user in context
 * (e.g., a landing page that doubles as a sign-in entry point).
 *
 * Use `ProtectedWithRedirect` instead when staying on the current URL
 * without authentication makes no sense (e.g., settings, admin panels).
 */
export function ProtectedWithLogin({ children }: ProtectedWithLoginProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Sign in to continue</h2>
        <LoginForm />
      </div>
    );
  }

  return <>{children}</>;
}
