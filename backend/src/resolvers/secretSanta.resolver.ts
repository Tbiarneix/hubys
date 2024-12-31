import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { isAuth } from '../middleware/auth';
import { SecretSanta, SecretSantaAssignment } from '../types/secretSanta';
import { Context } from '../types/context';
import { generateSecretSantaPairs } from '../utils/secretSanta';

const prisma = new PrismaClient();

@Resolver()
export class SecretSantaResolver {
  @Mutation(() => SecretSanta)
  @UseMiddleware(isAuth)
  async createSecretSanta(
    @Arg('groupId') groupId: string,
    @Ctx() { payload }: Context
  ): Promise<SecretSanta> {
    // Vérifier l'appartenance au groupe
    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: payload.userId,
      },
    });

    if (!isMember) throw new Error('Non autorisé');

    // Récupérer tous les membres du groupe
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: true },
    });

    const participants = members.map((member) => ({
      id: member.user.id,
      partnerId: member.user.partnerId,
    }));

    // Générer les paires
    const assignments = await generateSecretSantaPairs(participants, groupId);

    // Créer le Secret Santa et les assignations
    const secretSanta = await prisma.secretSanta.create({
      data: {
        groupId,
        year: new Date().getFullYear(),
        isActive: true,
        assignments: {
          create: assignments.map((assignment) => ({
            giverId: assignment.giverId,
            receiverId: assignment.receiverId,
          })),
        },
      },
      include: {
        group: true,
        assignments: {
          include: {
            giver: true,
            receiver: true,
          },
        },
      },
    });

    return secretSanta;
  }

  @Query(() => SecretSantaAssignment, { nullable: true })
  @UseMiddleware(isAuth)
  async mySecretSantaAssignment(
    @Arg('groupId') groupId: string,
    @Ctx() { payload }: Context
  ): Promise<SecretSantaAssignment | null> {
    return prisma.secretSantaAssignment.findFirst({
      where: {
        secretSanta: {
          groupId,
          isActive: true,
          year: new Date().getFullYear(),
        },
        giverId: payload.userId,
      },
      include: {
        secretSanta: true,
        giver: true,
        receiver: true,
      },
    });
  }
}