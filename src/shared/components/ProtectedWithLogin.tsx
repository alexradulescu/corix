import { ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import { Loading } from "./Loading";

interface ProtectedWithLoginProps {
  children: ReactNode;
}

export function ProtectedWithLogin({ children }: ProtectedWithLoginProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
        <h2>Please log in to continue</h2>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Inline login form will be implemented in Phase 2.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
