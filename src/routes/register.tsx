import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h1>Register</h1>
      <p style={{ marginTop: "1rem", color: "#666" }}>
        Registration form will be implemented in Phase 2.
      </p>
    </div>
  );
}
