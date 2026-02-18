import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedWithLogin } from "../shared/components/ProtectedWithLogin";

export const Route = createFileRoute("/groups")({
  component: GroupsLayout,
});

/**
 * Groups uses ProtectedWithLogin (inline form) instead of ProtectedWithRedirect
 * because /groups is the primary post-login landing — showing the login form
 * in-place is more welcoming than redirecting away and losing context.
 *
 * Compare with /settings which uses ProtectedWithRedirect to actively push
 * unauthenticated visitors to the login page.
 */
function GroupsLayout() {
  return (
    <ProtectedWithLogin>
      <Outlet />
    </ProtectedWithLogin>
  );
}
