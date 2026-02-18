import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Loading } from "./Loading";

interface GroupRoleGuardProps {
  groupId: Id<"groups">;
  /**
   * List of roles that are allowed to see the children.
   * E.g. `["admin"]` or `["admin", "editor"]`
   */
  requiredRoles: string[];
  children: ReactNode;
  /**
   * Optional custom fallback rendered when the user lacks the required role.
   * Defaults to a generic "no permission" message.
   */
  fallback?: ReactNode;
}

/**
 * Client-side role guard for group-specific pages.
 * Renders `children` only when the current user has one of `requiredRoles`
 * in the target group. Shows a loading spinner while the membership is
 * being fetched, and a permission-denied message (or `fallback`) otherwise.
 *
 * Note: this is a UX guard only. All security enforcement is on the backend.
 */
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
          border: "1px solid #fbbf24",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
          Access restricted
        </p>
        <p style={{ fontSize: "0.875rem" }}>
          Required role: <strong>{requiredRoles.join(" or ")}</strong>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
