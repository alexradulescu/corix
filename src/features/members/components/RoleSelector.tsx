import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface RoleSelectorProps {
  groupId: Id<"groups">;
  userId: Id<"users">;
  currentRole: string;
  canManage: boolean;
  isCurrentUser: boolean;
  isLastAdmin: boolean;
}

const roles = [
  { value: "admin", label: "Admin", color: "#16a34a" },
  { value: "editor", label: "Editor", color: "#2563eb" },
  { value: "viewer", label: "Viewer", color: "#666" },
  { value: "removed", label: "Removed", color: "#dc2626" },
];

export function RoleSelector({
  groupId,
  userId,
  currentRole,
  canManage,
  isCurrentUser,
  isLastAdmin,
}: RoleSelectorProps) {
  const changeRole = useMutation(api.memberships.changeRole);
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRoleData = roles.find((r) => r.value === currentRole) || roles[2];

  const handleChange = async (newRole: string) => {
    if (newRole === currentRole) return;

    setError(null);
    setIsChanging(true);

    try {
      await changeRole({
        groupId,
        userId,
        newRole,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change role");
    } finally {
      setIsChanging(false);
    }
  };

  if (!canManage || (isCurrentUser && currentRole === "admin" && isLastAdmin)) {
    // Show as read-only
    return (
      <span
        style={{
          padding: "0.25rem 0.5rem",
          fontSize: "0.75rem",
          borderRadius: "4px",
          backgroundColor: currentRoleData.color + "20",
          color: currentRoleData.color,
          fontWeight: 500,
        }}
      >
        {currentRoleData.label}
        {isCurrentUser && currentRole === "admin" && isLastAdmin && (
          <span style={{ marginLeft: "0.25rem", opacity: 0.7 }}>(last admin)</span>
        )}
      </span>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <select
        value={currentRole}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isChanging}
        style={{
          padding: "0.25rem 0.5rem",
          fontSize: "0.75rem",
          borderRadius: "4px",
          border: "1px solid #ddd",
          backgroundColor: "white",
          cursor: isChanging ? "wait" : "pointer",
          color: currentRoleData.color,
        }}
      >
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
      {error && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.25rem",
            padding: "0.25rem 0.5rem",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            fontSize: "0.75rem",
            borderRadius: "4px",
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
