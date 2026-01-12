import { createFileRoute } from "@tanstack/react-router";
import { ProtectedWithRedirect } from "../shared/components/ProtectedWithRedirect";

export const Route = createFileRoute("/groups")({
  component: GroupsPage,
});

function GroupsPage() {
  return (
    <ProtectedWithRedirect>
      <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
        <h1>My Groups</h1>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Groups functionality will be implemented in Phase 6.
        </p>
      </div>
    </ProtectedWithRedirect>
  );
}
