import { Server as HTTPServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { getSession } from 'next-auth/react';
import prisma from './prisma';

interface GroupMember {
  groupId: string;
}

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new IOServer(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
  });

  // Middleware d'authentification
  io.use(async (socket, next) => {
    try {
      const session = await getSession({ req: socket.request });
      if (!session?.user?.id) {
        return next(new Error('Unauthorized'));
      }
      socket.data.userId = session.user.id;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Rejoindre les salons des groupes
    socket.on('join-groups', async (groupIds: string[]) => {
      try {
        const userId = socket.data.userId;
        
        // Vérifier que l'utilisateur est membre de ces groupes
        const memberships = await prisma.groupMember.findMany({
          where: {
            userId,
            groupId: {
              in: groupIds,
            },
          },
        });

        const validGroupIds = memberships.map((m: GroupMember) => m.groupId);
        validGroupIds.forEach((groupId: string) => {
          socket.join(`group:${groupId}`);
        });
      } catch (error) {
        console.error('Error joining groups:', error);
      }
    });

    // Envoyer un message
    socket.on('send-message', async (data: { groupId: string; content: string }) => {
      try {
        const userId = socket.data.userId;

        // Vérifier que l'utilisateur est membre du groupe
        const membership = await prisma.groupMember.findFirst({
          where: {
            userId,
            groupId: data.groupId,
          },
        });

        if (!membership) {
          throw new Error('Not a member of this group');
        }

        // Créer le message
        const message = await prisma.groupMessage.create({
          data: {
            content: data.content,
            groupId: data.groupId,
            userId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        // Émettre le message à tous les membres du groupe
        io.to(`group:${data.groupId}`).emit('new-message', message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
