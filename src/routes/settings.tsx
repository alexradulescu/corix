import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ProtectedWithRedirect } from "../shared/components/ProtectedWithRedirect";

export const Route = createFileRoute("/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <ProtectedWithRedirect>
      <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
        <h1 style={{ marginBottom: "1.5rem" }}>Settings</h1>

        <div style={{ display: "flex", gap: "2rem" }}>
          <nav style={{ minWidth: "150px" }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>
                <Link
                  to="/settings"
                  activeProps={{ style: { fontWeight: "bold" } }}
                  activeOptions={{ exact: true }}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/settings/security"
                  activeProps={{ style: { fontWeight: "bold" } }}
                >
                  Security
                </Link>
              </li>
            </ul>
          </nav>

          <div style={{ flex: 1 }}>
            <Outlet />
          </div>
        </div>
      </div>
    </ProtectedWithRedirect>
  );
}
