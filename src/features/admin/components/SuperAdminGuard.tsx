import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navigate } from "@tanstack/react-router";
import { ReactNode } from "react";

interface SuperAdminGuardProps {
  children: ReactNode;
}

export function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const currentUser = useQuery(api.users.currentUser);

  // Loading state
  if (currentUser === undefined) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Not a super-admin
  if (!currentUser.isSuperAdmin) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Access Denied</h1>
        <p>You must be a super-admin to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
