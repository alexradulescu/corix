import { useState, FormEvent, ReactNode } from "react";

interface PasswordConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function PasswordConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm your password",
  description = "Please enter your current password to continue.",
  children,
}: PasswordConfirmDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm(password);
      setPassword("");
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Confirmation failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%",
          margin: "1rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: "0.5rem" }}>{title}</h2>
        <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          {description}
        </p>

        {children}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label htmlFor="confirm-password" style={{ display: "block", marginBottom: "0.25rem" }}>
              Current Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </div>

          {error && (
            <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={handleClose} style={{ backgroundColor: "#e5e5e5", color: "#333" }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
