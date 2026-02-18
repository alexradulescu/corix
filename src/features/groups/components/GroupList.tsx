import { Link } from "@tanstack/react-router";
import { GroupCard } from "./GroupCard";
import { GroupWithMembership } from "../types";

interface GroupListProps {
  groups: GroupWithMembership[];
}

export function GroupList({ groups }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <p style={{ color: "#666", marginBottom: "1rem" }}>
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {activeGroups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        </section>
      )}

      {removedGroups.length > 0 && (
        <section>
          <h2 style={{ marginBottom: "1rem", color: "#666" }}>Removed From</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {removedGroups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
