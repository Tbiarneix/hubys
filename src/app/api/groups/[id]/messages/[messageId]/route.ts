import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

// DELETE /api/groups/[id]/messages/[messageId] - Supprimer un message
type Params = {
  params: Promise<{ id: string; messageId: string }>
}

export async function DELETE(
  request: Request,
  context: Params
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { id: groupId, messageId } = params;

    // Vérifier que l'utilisateur est membre du groupe
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Vérifier que le message existe et appartient à l'utilisateur
    const message = await prisma.groupMessage.findFirst({
      where: {
        id: messageId,
        groupId,
        userId: session.user.id,
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Marquer le message comme supprimé
    const updatedMessage = await prisma.groupMessage.update({
      where: {
        id: messageId,
      },
      data: {
        content: '[Message supprimé]',
        isDeleted: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
