import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

interface InvitationType {
  id: string;
  groupId: string;
  group: { name: string };
  email: string | null;
  status: string;
  fromUser: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

// GET /api/groups/invitations - Récupérer toutes les invitations de l'utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer les invitations où l'email correspond à celui de l'utilisateur
    const invitations = await prisma.groupInvitation.findMany({
      where: {
        email: session.user.email,
        status: 'PENDING',
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Transformer les données pour correspondre à l'interface GroupInvitation
    const formattedInvitations = invitations.map((invitation: InvitationType) => ({
      id: invitation.id,
      groupId: invitation.groupId,
      groupName: invitation.group.name,
      email: invitation.email,
      status: invitation.status,
      fromUser: {
        id: invitation.fromUser.id,
        name: invitation.fromUser.name,
        email: invitation.fromUser.email,
        avatar: invitation.fromUser.avatar,
      },
      toUser: null,
    }));

    return NextResponse.json(formattedInvitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
