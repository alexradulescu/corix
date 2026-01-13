import { createFileRoute, Link } from "@tanstack/react-router";
import { CreateGroupForm } from "../../features/groups";

export const Route = createFileRoute("/groups/new")({
  component: CreateGroupPage,
});

function CreateGroupPage() {
  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/groups" style={{ fontSize: "0.875rem" }}>
          &larr; Back to groups
        </Link>
      </div>

      <h1 style={{ marginBottom: "1.5rem" }}>Create New Group</h1>

      <CreateGroupForm />
    </div>
  );
}
