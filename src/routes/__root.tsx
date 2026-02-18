import { createRootRoute, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Layout } from "../shared/components/Layout";
import { Notifications } from "../shared/components/Notifications";

// Lazy-load devtools so they are excluded from production bundles
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      }))
    )
  : () => null;

export const Route = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
      <Notifications />
      <Suspense fallback={null}>
        <TanStackRouterDevtools />
      </Suspense>
    </Layout>
  ),
});
