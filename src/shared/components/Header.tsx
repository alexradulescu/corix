import { Link } from "@tanstack/react-router";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import styles from "./shared.module.css";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.users.currentUser);

  return (
    <header className={styles.header}>
      <Link
        to={isAuthenticated ? "/groups" : "/login"}
        className={styles.headerLogo}
      >
        Corix
      </Link>

      <nav className={styles.headerNav}>
        {isLoading ? null : isAuthenticated ? (
          <>
            <Link to="/groups">My Groups</Link>
            {currentUser?.isSuperAdmin && (
              <Link to="/admin/groups" className={styles.adminBadge}>
                Admin
              </Link>
            )}
            <Link to="/settings">Settings</Link>
            <button onClick={() => void signOut()} style={{ padding: "0.4em 0.8em", fontSize: "0.9em" }}>
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
