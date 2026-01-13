import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loading } from "../../shared/components/Loading";
import { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/groups/$groupId")({
  component: GroupLayout,
});

function GroupLayout() {
  const { groupId } = Route.useParams();
  const group = useQuery(api.groups.getGroup, { groupId: groupId as Id<"groups"> });

  if (group === undefined) {
    return <Loading />;
  }

  if (group === null) {
    return (
      <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
        <h1>Group Not Found</h1>
        <p style={{ color: "#666", marginTop: "1rem" }}>
          This group doesn't exist or you don't have access to it.
        </p>
        <Link to="/groups" style={{ marginTop: "1rem", display: "inline-block" }}>
          &larr; Back to groups
        </Link>
      </div>
    );
  }

  const isRemoved = group.membership.role === "removed";
  const isDeleted = !!group.deletedAt;

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/groups" style={{ fontSize: "0.875rem" }}>
          &larr; Back to groups
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>{group.name}</h1>
        <span
          style={{
            padding: "0.25rem 0.75rem",
            fontSize: "0.875rem",
            borderRadius: "4px",
            backgroundColor: isRemoved ? "#fee2e2" : "#dcfce7",
            color: isRemoved ? "#dc2626" : "#16a34a",
          }}
        >
          {group.membership.role}
        </span>
      </div>

      {isDeleted && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fee",
            border: "1px solid #dc2626",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            color: "#dc2626",
          }}
        >
          <strong>⚠ This group has been soft deleted.</strong> It is archived and all members have been removed. Only super-admins can restore this group.
        </div>
      )}

      {isRemoved ? (
        <div style={{ padding: "2rem", backgroundColor: "#f5f5f5", borderRadius: "8px", textAlign: "center" }}>
          <p style={{ color: "#666" }}>
            You have been removed from this group. You can only see the group name.
          </p>
        </div>
      ) : (
        <>
          <nav
            style={{
              display: "flex",
              gap: "1rem",
              borderBottom: "1px solid #ddd",
              marginBottom: "1.5rem",
              paddingBottom: "0.5rem",
            }}
          >
            <Link
              to="/groups/$groupId/messages"
              params={{ groupId }}
              activeProps={{ style: { fontWeight: "bold", color: "#000" } }}
            >
              Messages
            </Link>
            <Link
              to="/groups/$groupId/members"
              params={{ groupId }}
              activeProps={{ style: { fontWeight: "bold", color: "#000" } }}
            >
              Members
            </Link>
            {group.membership.role === "admin" && (
              <>
                <Link
                  to="/groups/$groupId/invitations"
                  params={{ groupId }}
                  activeProps={{ style: { fontWeight: "bold", color: "#000" } }}
                >
                  Invitations
                </Link>
                <Link
                  to="/groups/$groupId/audit"
                  params={{ groupId }}
                  activeProps={{ style: { fontWeight: "bold", color: "#000" } }}
                >
                  Audit Log
                </Link>
                <Link
                  to="/groups/$groupId/settings"
                  params={{ groupId }}
                  activeProps={{ style: { fontWeight: "bold", color: "#000" } }}
                >
                  Settings
                </Link>
              </>
            )}
          </nav>

          <Outlet />
        </>
      )}
    </div>
  );
}
