import { User } from "./user";

export interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  user: User;
  joinedAt: Date;
}

export interface GroupInvitation {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  group: Group;
}