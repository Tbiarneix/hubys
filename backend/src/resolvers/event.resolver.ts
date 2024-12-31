import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { isAuth } from '../middleware/auth';
import { Event } from '../types/event';
import { Context } from '../types/context';

const prisma = new PrismaClient();

@Resolver()
export class EventResolver {
  @Query(() => [Event])
  @UseMiddleware(isAuth)
  async groupEvents(
    @Arg('groupId') groupId: string,
    @Ctx() { payload }: Context
  ): Promise<Event[]> {
    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: payload.userId,
      },
    });

    if (!isMember) throw new Error('Non autorisé');

    return prisma.event.findMany({
      where: { groupId },
      include: {
        group: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  @Mutation(() => Event)
  @UseMiddleware(isAuth)
  async createEvent(
    @Arg('name') name: string,
    @Arg('startDate') startDate: Date,
    @Arg('endDate') endDate: Date,
    @Arg('isVacation') isVacation: boolean,
    @Arg('groupId', { nullable: true }) groupId?: string,
    @Ctx() { payload }: Context
  ): Promise<Event> {
    if (groupId) {
      const isMember = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId: payload.userId,
        },
      });

      if (!isMember) throw new Error('Non autorisé');
    }

    return prisma.event.create({
      data: {
        name,
        startDate,
        endDate,
        isVacation,
        groupId,
        participants: {
          create: {
            userId: payload.userId,
            presence: JSON.stringify({}),
          },
        },
      },
      include: {
        group: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}