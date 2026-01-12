import { createFileRoute } from "@tanstack/react-router";
import { ProtectedWithRedirect } from "../shared/components/ProtectedWithRedirect";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <ProtectedWithRedirect>
      <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
        <h1>Settings</h1>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          User settings will be implemented in Phase 4.
        </p>
      </div>
    </ProtectedWithRedirect>
  );
}
