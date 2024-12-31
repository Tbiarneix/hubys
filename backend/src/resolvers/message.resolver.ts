import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware, Subscription, Root, PubSub, Publisher } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { isAuth } from '../middleware/auth';
import { Message } from '../types/message';
import { Context } from '../types/context';

const prisma = new PrismaClient();

@Resolver()
export class MessageResolver {
  @Query(() => [Message])
  @UseMiddleware(isAuth)
  async groupMessages(
    @Arg('groupId') groupId: string,
    @Arg('limit', { defaultValue: 50 }) limit: number,
    @Arg('offset', { defaultValue: 0 }) offset: number,
    @Ctx() { payload }: Context
  ): Promise<Message[]> {
    // Vérifier l'appartenance au groupe
    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: payload.userId,
      },
    });

    if (!isMember) throw new Error('Non autorisé');

    return prisma.message.findMany({
      where: { groupId },
      include: {
        user: true,
        group: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  @Mutation(() => Message)
  @UseMiddleware(isAuth)
  async sendMessage(
    @Arg('groupId') groupId: string,
    @Arg('content') content: string,
    @Ctx() { payload }: Context,
    @PubSub('NEW_MESSAGE') publish: Publisher<Message>
  ): Promise<Message> {
    const message = await prisma.message.create({
      data: {
        content,
        userId: payload.userId,
        groupId,
      },
      include: {
        user: true,
        group: true,
      },
    });

    await publish(message);
    return message;
  }

  @Subscription(() => Message, {
    topics: 'NEW_MESSAGE',
    filter: ({ payload, args }) => payload.groupId === args.groupId,
  })
  newMessage(
    @Root() message: Message,
    @Arg('groupId') _groupId: string,
  ): Message {
    return message;
  }
}