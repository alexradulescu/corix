import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Loading } from "./Loading";

interface GroupRoleGuardProps {
  groupId: Id<"groups">;
  requiredRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function GroupRoleGuard({
  groupId,
  requiredRoles,
  children,
  fallback,
}: GroupRoleGuardProps) {
  const membership = useQuery(api.memberships.getMyMembership, { groupId });

  if (membership === undefined) {
    return <Loading />;
  }

  if (!membership || !requiredRoles.includes(membership.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#fef3c7",
          borderRadius: "8px",
          color: "#92400e",
        }}
      >
        <p>You don't have permission to access this page.</p>
        <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
          Required role: {requiredRoles.join(" or ")}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
