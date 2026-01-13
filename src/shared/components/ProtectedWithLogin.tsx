import { ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import { Loading } from "./Loading";
import { LoginForm } from "../../features/auth";

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
        <h2 style={{ marginBottom: "1rem" }}>Please log in to continue</h2>
        <LoginForm />
      </div>
    );
  }

  return <>{children}</>;
}
