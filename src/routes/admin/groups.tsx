import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import styles from "./groups.module.css";

export const Route = createFileRoute("/admin/groups")({
  component: AdminGroupsPage,
});

function AdminGroupsPage() {
  const groups = useQuery(api.groups.getAllGroups);
  const restoreGroup = useMutation(api.groups.restoreGroup);
  const hardDeleteGroup = useMutation(api.groups.hardDeleteGroup);
  const allUsers = useQuery(api.users.getAllUsers);

  const [restoringGroupId, setRestoringGroupId] = useState<Id<"groups"> | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState<Id<"users"> | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<Id<"groups"> | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const handleRestore = async (groupId: Id<"groups">) => {
    if (!selectedAdminId) {
      alert("Please select an admin for the restored group");
      return;
    }
    try {
      await restoreGroup({ groupId, newAdminId: selectedAdminId });
      setRestoringGroupId(null);
      setSelectedAdminId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to restore group");
    }
  };

  const handleHardDelete = async (groupId: Id<"groups">, groupName: string) => {
    if (confirmText !== groupName) {
      alert("Group name doesn't match");
      return;
    }
    try {
      await hardDeleteGroup({ groupId });
      setDeletingGroupId(null);
      setConfirmText("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete group");
    }
  };

  if (groups === undefined || allUsers === undefined) {
    return <div>Loading...</div>;
  }

  const activeGroups = groups.filter((g) => !g.deletedAt);
  const deletedGroups = groups.filter((g) => g.deletedAt);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin: Groups Management</h1>
        <nav className={styles.nav}>
          <Link to="/admin/groups" className={styles.activeLink}>
            Groups
          </Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/groups">Back to App</Link>
        </nav>
      </header>

      <section className={styles.section}>
        <h2>Active Groups ({activeGroups.length})</h2>
        {activeGroups.length === 0 ? (
          <p>No active groups</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Creator</th>
                <th>Members</th>
                <th>Active Members</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeGroups.map((group) => (
                <tr key={group._id}>
                  <td>{group.name}</td>
                  <td>{group.creatorEmail}</td>
                  <td>{group.memberCount}</td>
                  <td>{group.activeMembers}</td>
                  <td>{new Date(group.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => setDeletingGroupId(group._id)}
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

      <section className={styles.section}>
        <h2>Soft-Deleted Groups ({deletedGroups.length})</h2>
        {deletedGroups.length === 0 ? (
          <p>No soft-deleted groups</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Creator</th>
                <th>Members</th>
                <th>Deleted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletedGroups.map((group) => (
                <tr key={group._id}>
                  <td>{group.name}</td>
                  <td>{group.creatorEmail}</td>
                  <td>{group.memberCount}</td>
                  <td>
                    {group.deletedAt
                      ? new Date(group.deletedAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      onClick={() => setRestoringGroupId(group._id)}
                      className={styles.primaryButton}
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => setDeletingGroupId(group._id)}
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

      {/* Restore Modal */}
      {restoringGroupId && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Restore Group</h3>
            <p>Select a new admin for the restored group:</p>
            <select
              value={selectedAdminId || ""}
              onChange={(e) => setSelectedAdminId(e.target.value as Id<"users">)}
              className={styles.select}
            >
              <option value="">Select a user...</option>
              {allUsers
                .filter((u) => !u.deletedAt)
                .map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.email} ({user.activeMemberships} groups)
                  </option>
                ))}
            </select>
            <div className={styles.modalActions}>
              <button
                onClick={() => handleRestore(restoringGroupId)}
                disabled={!selectedAdminId}
                className={styles.primaryButton}
              >
                Restore
              </button>
              <button
                onClick={() => {
                  setRestoringGroupId(null);
                  setSelectedAdminId(null);
                }}
                className={styles.secondaryButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hard Delete Modal */}
      {deletingGroupId && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Hard Delete Group</h3>
            <p className={styles.warningText}>
              This will permanently delete the group and all associated data
              (messages, invitations, memberships, audit logs). This action cannot be
              undone.
            </p>
            <p>
              Type the group name to confirm:{" "}
              <strong>
                {groups.find((g) => g._id === deletingGroupId)?.name}
              </strong>
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Group name"
              className={styles.input}
            />
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  const group = groups.find((g) => g._id === deletingGroupId);
                  if (group) {
                    handleHardDelete(deletingGroupId, group.name);
                  }
                }}
                disabled={
                  confirmText !==
                  groups.find((g) => g._id === deletingGroupId)?.name
                }
                className={styles.dangerButton}
              >
                Hard Delete
              </button>
              <button
                onClick={() => {
                  setDeletingGroupId(null);
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
