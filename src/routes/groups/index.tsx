import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loading } from "../../shared/components/Loading";
import { GroupList } from "../../features/groups";

export const Route = createFileRoute("/groups/")({
  component: GroupsIndexPage,
});

function GroupsIndexPage() {
  const groups = useQuery(api.groups.myGroups);

  if (groups === undefined) {
    return <Loading />;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>My Groups</h1>
        <Link to="/groups/new">
          <button>Create Group</button>
        </Link>
      </div>

      <GroupList groups={groups} />
    </div>
  );
}
