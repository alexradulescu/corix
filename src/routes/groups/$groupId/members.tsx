import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "../../../shared/components/Loading";
import { MemberList } from "../../../features/members";

export const Route = createFileRoute("/groups/$groupId/members")({
  component: GroupMembersPage,
});

function GroupMembersPage() {
  const { groupId } = Route.useParams();
  const group = useQuery(api.groups.getGroup, { groupId: groupId as Id<"groups"> });
  const user = useQuery(api.users.currentUser);

  if (group === undefined || user === undefined) {
    return <Loading />;
  }

  if (group === null || user === null) {
    return <div>Not found</div>;
  }

  return (
    <MemberList
      groupId={groupId as Id<"groups">}
      currentUserRole={group.membership.role}
      currentUserId={user._id}
    />
  );
}
