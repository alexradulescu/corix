import { Link } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

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
