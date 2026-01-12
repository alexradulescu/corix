import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedWithRedirect } from "../shared/components/ProtectedWithRedirect";

export const Route = createFileRoute("/groups")({
  component: GroupsLayout,
});

function GroupsLayout() {
  return (
    <ProtectedWithRedirect>
      <Outlet />
    </ProtectedWithRedirect>
  );
}
