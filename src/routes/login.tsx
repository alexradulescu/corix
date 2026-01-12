import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h1>Login</h1>
      <p style={{ marginTop: "1rem", color: "#666" }}>
        Login form will be implemented in Phase 2.
      </p>
    </div>
  );
}
