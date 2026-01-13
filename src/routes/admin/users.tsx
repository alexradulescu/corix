import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import styles from "./users.module.css";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const users = useQuery(api.users.getAllUsers);
  const hardDeleteUser = useMutation(api.users.hardDeleteUser);

  const [deletingUserId, setDeletingUserId] = useState<Id<"users"> | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const handleHardDelete = async (userId: Id<"users">, userEmail: string) => {
    if (confirmText !== "DELETE") {
      alert("Please type DELETE to confirm");
      return;
    }
    try {
      await hardDeleteUser({ userId });
      setDeletingUserId(null);
      setConfirmText("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete user");
    }
  };

  if (users === undefined) {
    return <div>Loading...</div>;
  }

  const activeUsers = users.filter((u) => !u.deletedAt);
  const deletedUsers = users.filter((u) => u.deletedAt);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin: Users Management</h1>
        <nav className={styles.nav}>
          <Link to="/admin/groups">Groups</Link>
          <Link to="/admin/users" className={styles.activeLink}>
            Users
          </Link>
          <Link to="/groups">Back to App</Link>
        </nav>
      </header>

      <section className={styles.section}>
        <h2>Active Users ({activeUsers.length})</h2>
        {activeUsers.length === 0 ? (
          <p>No active users</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Total Groups</th>
                <th>Active Groups</th>
                <th>Admin Of</th>
                <th>Super Admin</th>
                <th>Email Verified</th>
                <th>2FA</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.email || "N/A"}</td>
                  <td>{user.membershipCount}</td>
                  <td>{user.activeMemberships}</td>
                  <td>{user.adminOfGroups}</td>
                  <td>{user.isSuperAdmin ? "Yes" : "No"}</td>
                  <td>{user.emailVerificationTime ? "Yes" : "No"}</td>
                  <td>{user.totpEnabled ? "Yes" : "No"}</td>
                  <td>
                    {user.creationTime
                      ? new Date(user.creationTime).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      onClick={() => setDeletingUserId(user._id)}
                      className={styles.dangerButton}
                      disabled={user.isSuperAdmin}
                      title={
                        user.isSuperAdmin
                          ? "Cannot delete super-admin users"
                          : "Hard delete user"
                      }
                    >
                      Hard Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.section}>
        <h2>Soft-Deleted Users ({deletedUsers.length})</h2>
        {deletedUsers.length === 0 ? (
          <p>No soft-deleted users</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Deleted ID</th>
                <th>Total Groups</th>
                <th>Deleted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletedUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.deletedUserId || "N/A"}</td>
                  <td>{user.membershipCount}</td>
                  <td>
                    {user.deletedAt
                      ? new Date(user.deletedAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      onClick={() => setDeletingUserId(user._id)}
                      className={styles.dangerButton}
                    >
                      Hard Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Hard Delete Modal */}
      {deletingUserId && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Hard Delete User</h3>
            <p className={styles.warningText}>
              This will permanently delete the user and all associated data
              (memberships, invitations, audit logs). Messages will be preserved but
              shown as deleted user. This action cannot be undone.
            </p>
            <p>
              User:{" "}
              <strong>
                {users.find((u) => u._id === deletingUserId)?.email ||
                  users.find((u) => u._id === deletingUserId)?.deletedUserId ||
                  "Unknown"}
              </strong>
            </p>
            <p>Type DELETE to confirm:</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className={styles.input}
            />
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  const user = users.find((u) => u._id === deletingUserId);
                  if (user) {
                    handleHardDelete(
                      deletingUserId,
                      user.email || user.deletedUserId || "Unknown"
                    );
                  }
                }}
                disabled={confirmText !== "DELETE"}
                className={styles.dangerButton}
              >
                Hard Delete
              </button>
              <button
                onClick={() => {
                  setDeletingUserId(null);
                  setConfirmText("");
                }}
                className={styles.secondaryButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
