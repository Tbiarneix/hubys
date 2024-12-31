import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { isAuth } from '../middleware/auth';
import { Group, GroupInvitation } from '../types/group';
import { Context } from '../types/context';
import { sendInvitationEmail } from '../utils/email';

const prisma = new PrismaClient();

@Resolver()
export class GroupResolver {
  @Query(() => [Group])
  @UseMiddleware(isAuth)
  async myGroups(@Ctx() { payload }: Context): Promise<Group[]> {
    return prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: payload.userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  @Mutation(() => Group)
  @UseMiddleware(isAuth)
  async createGroup(
    @Arg('name') name: string,
    @Ctx() { payload }: Context,
  ): Promise<Group> {
    return prisma.group.create({
      data: {
        name,
        members: {
          create: {
            userId: payload.userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  @Mutation(() => GroupInvitation)
  @UseMiddleware(isAuth)
  async inviteToGroup(
    @Arg('groupId') groupId: string,
    @Arg('email') email: string,
    @Ctx() { payload }: Context,
  ): Promise<GroupInvitation> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) throw new Error('Groupe non trouvé');

    const isMember = group.members.some(member => member.userId === payload.userId);
    if (!isMember) throw new Error('Non autorisé');

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const invitation = await prisma.groupInvitation.create({
      data: {
        email,
        token,
        expiresAt,
        groupId,
      },
      include: {
        group: true,
      },
    });

    await sendInvitationEmail(email, token, group.name);

    return invitation;
  }

  @Mutation(() => Group)
  @UseMiddleware(isAuth)
  async acceptInvitation(
    @Arg('token') token: string,
    @Ctx() { payload }: Context,
  ): Promise<Group> {
    const invitation = await prisma.groupInvitation.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!invitation) throw new Error('Invitation invalide ou expirée');

    const group = await prisma.group.update({
      where: { id: invitation.groupId },
      data: {
        members: {
          create: {
            userId: payload.userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    await prisma.groupInvitation.delete({
      where: { id: invitation.id },
    });

    return group;
  }
}