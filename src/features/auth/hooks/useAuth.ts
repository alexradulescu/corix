import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);

  return {
    isAuthenticated,
    isLoading: isLoading || (isAuthenticated && user === undefined),
    user,
    isSuperAdmin: user?.isSuperAdmin ?? false,
  };
}
