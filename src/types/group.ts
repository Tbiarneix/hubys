export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  joinedAt: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  email: string | null;
  token: string;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface SecretSanta {
  id: string;
  year: number;
  groupId: string;
  createdAt: string;
  assignments: SecretSantaAssignment[];
}

export interface SecretSantaAssignment {
  id: string;
  secretSantaId: string;
  giverId: string;
  receiverId: string;
  createdAt: string;
  receiver: {
    id: string;
    name: string;
  };
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  members: GroupMember[];
  invitations: GroupInvitation[];
  messages: GroupMessage[];
  deletionVotes: string[];
  secretSantas?: SecretSanta[];
}
