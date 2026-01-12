import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/$groupId/")({
  component: GroupIndexRedirect,
});

function GroupIndexRedirect() {
  const { groupId } = Route.useParams();
  return <Navigate to="/groups/$groupId/messages" params={{ groupId }} />;
}
