import { Link } from "@tanstack/react-router";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.users.currentUser);

  return (
    <header
      style={{
        padding: "1rem 2rem",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        to={isAuthenticated ? "/groups" : "/login"}
        style={{ fontWeight: "bold", fontSize: "1.25rem" }}
      >
        Corix
      </Link>

      <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {isLoading ? null : isAuthenticated ? (
          <>
            <Link to="/groups">My Groups</Link>
            {currentUser?.isSuperAdmin && (
              <Link
                to="/admin/groups"
                style={{
                  backgroundColor: "#ffc107",
                  color: "#000",
                  padding: "0.4em 0.8em",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Admin
              </Link>
            )}
            <Link to="/settings">Settings</Link>
            <button
              onClick={() => void signOut()}
              style={{ padding: "0.4em 0.8em", fontSize: "0.9em" }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
