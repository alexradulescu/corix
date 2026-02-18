import { useNotificationStore } from "../../stores/notificationStore";

const typeStyles: Record<string, { backgroundColor: string; color: string; borderColor: string }> = {
  success: { backgroundColor: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" },
  error:   { backgroundColor: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" },
  info:    { backgroundColor: "#eff6ff", color: "#1e40af", borderColor: "#bfdbfe" },
};

export function Notifications() {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        zIndex: 2000,
        maxWidth: "360px",
        width: "100%",
      }}
      aria-live="polite"
      aria-label="Notifications"
    >
      {notifications.map((n) => {
        const styles = typeStyles[n.type] ?? typeStyles.info;
        return (
          <div
            key={n.id}
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              border: `1px solid ${styles.borderColor}`,
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              fontSize: "0.875rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <span>{n.message}</span>
            <button
              onClick={() => removeNotification(n.id)}
              aria-label="Dismiss notification"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
                opacity: 0.6,
                padding: 0,
                fontSize: "1rem",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
