import { Link } from "@tanstack/react-router";

interface GroupWithMembership {
  _id: string;
  name: string;
  createdAt: number;
  deletedAt?: number;
  membership: {
    role: string;
    joinedAt: number;
  };
}

interface GroupCardProps {
  group: GroupWithMembership;
}

const roleColors: Record<string, string> = {
  admin: "#16a34a",
  editor: "#2563eb",
  viewer: "#666",
  removed: "#dc2626",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
  removed: "Removed",
};

export function GroupCard({ group }: GroupCardProps) {
  const isRemoved = group.membership.role === "removed";
  const isDeleted = !!group.deletedAt;

  return (
    <div
      style={{
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: isRemoved || isDeleted ? "#fafafa" : "white",
        opacity: isRemoved || isDeleted ? 0.8 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          {isRemoved ? (
            <h3 style={{ marginBottom: "0.5rem", color: "#666" }}>{group.name}</h3>
          ) : (
            <Link
              to="/groups/$groupId"
              params={{ groupId: group._id }}
              style={{ textDecoration: "none" }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>{group.name}</h3>
            </Link>
          )}

          <p style={{ fontSize: "0.75rem", color: "#999" }}>
            Joined {new Date(group.membership.joinedAt).toLocaleDateString()}
          </p>
        </div>

        <span
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.75rem",
            borderRadius: "4px",
            backgroundColor: roleColors[group.membership.role] + "20",
            color: roleColors[group.membership.role],
            fontWeight: 500,
          }}
        >
          {roleLabels[group.membership.role] || group.membership.role}
        </span>
      </div>

      {isDeleted && (
        <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.5rem" }}>
          This group has been deleted
        </p>
      )}

      {!isRemoved && !isDeleted && (
        <div style={{ marginTop: "1rem" }}>
          <Link
            to="/groups/$groupId/messages"
            params={{ groupId: group._id }}
            style={{ fontSize: "0.875rem" }}
          >
            View messages
          </Link>
        </div>
      )}
    </div>
  );
}
