import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import { Group, GroupMember, GroupMessage, GroupInvitation } from '@prisma/client';

type GroupWithRelations = Group & {
  members: (GroupMember & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      avatar: string | null;
    };
  })[];
  messages: (GroupMessage & {
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
  })[];
  invitations: GroupInvitation[];
  _count: {
    deletionVotes: number;
  };
};

type SanitizedGroup = Omit<GroupWithRelations, '_count'> & {
  deletionVotesCount: number;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        invitations: true,
        _count: {
          select: {
            deletionVotes: true,
          },
        },
      },
    }) as GroupWithRelations[];

    const sanitizedGroups: SanitizedGroup[] = groups.map(group => {
      const { _count, ...groupData } = group;
      return {
        ...groupData,
        members: group.members || [],
        messages: group.messages || [],
        invitations: group.invitations || [],
        deletionVotesCount: _count?.deletionVotes ?? 0
      };
    });

    return NextResponse.json(sanitizedGroups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: {
      name,
      members: {
        create: {
          userId: user.id,
          role: 'MEMBER',
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(group);
}
