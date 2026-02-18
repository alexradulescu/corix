export interface GroupWithMembership {
  _id: string;
  name: string;
  createdAt: number;
  deletedAt?: number;
  membership: {
    role: string;
    joinedAt: number;
  };
}
