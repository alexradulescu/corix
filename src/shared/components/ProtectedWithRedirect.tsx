import { ReactNode } from "react";
import { Navigate, useLocation } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { Loading } from "./Loading";

interface ProtectedWithRedirectProps {
  children: ReactNode;
}

export function ProtectedWithRedirect({ children }: ProtectedWithRedirectProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        search={{ returnTo: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
