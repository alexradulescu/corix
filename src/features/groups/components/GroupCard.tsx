import { Link } from "@tanstack/react-router";
import { GroupWithMembership } from "../types";
import styles from "./groups.module.css";

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
  const muted = isRemoved || isDeleted;

  return (
    <div className={`${styles.card} ${muted ? styles.cardMuted : ""}`}>
      <div className={styles.cardHeader}>
        <div style={{ flex: 1 }}>
          {isRemoved ? (
            <h3 className={styles.cardTitle} style={{ color: "#666" }}>{group.name}</h3>
          ) : (
            <Link
              to="/groups/$groupId"
              params={{ groupId: group._id }}
              style={{ textDecoration: "none" }}
            >
              <h3 className={styles.cardTitle}>{group.name}</h3>
            </Link>
          )}

          <p className={styles.cardMeta}>
            Joined {new Date(group.membership.joinedAt).toLocaleDateString()}
          </p>
        </div>

        <span
          className={styles.badge}
          style={{
            backgroundColor: roleColors[group.membership.role] + "20",
            color: roleColors[group.membership.role],
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
