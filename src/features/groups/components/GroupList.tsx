import { Link } from "@tanstack/react-router";
import { GroupCard } from "./GroupCard";
import { GroupWithMembership } from "../types";
import styles from "./groups.module.css";

interface GroupListProps {
  groups: GroupWithMembership[];
}

export function GroupList({ groups }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p style={{ marginBottom: "1rem" }}>
          You're not a member of any groups yet.
        </p>
        <Link to="/groups/new">
          <button>Create your first group</button>
        </Link>
      </div>
    );
  }

  const activeGroups = groups.filter((g) => g.membership.role !== "removed");
  const removedGroups = groups.filter((g) => g.membership.role === "removed");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {activeGroups.length > 0 && (
        <section>
          <h2 style={{ marginBottom: "1rem" }}>Active Groups</h2>
          <div className={styles.grid}>
            {activeGroups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        </section>
      )}

      {removedGroups.length > 0 && (
        <section>
          <h2 style={{ marginBottom: "1rem", color: "#666" }}>Removed From</h2>
          <div className={styles.grid}>
            {removedGroups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
