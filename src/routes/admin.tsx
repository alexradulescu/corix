import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SuperAdminGuard } from "../features/admin/components/SuperAdminGuard";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SuperAdminGuard>
      <Outlet />
    </SuperAdminGuard>
  );
}
