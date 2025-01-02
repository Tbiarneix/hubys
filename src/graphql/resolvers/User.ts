import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    users: async () => {
      return prisma.user.findMany();
    },
    user: async (_, { id }) => {
      return prisma.user.findUnique({
        where: { id },
      });
    },
    me: async (_, __, { user }) => {
      if (!user) return null;
      return prisma.user.findUnique({
        where: { id: user.id },
      });
    },
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const hashedPassword = await hash(input.password, 10);
      return prisma.user.create({
        data: {
          ...input,
          password: hashedPassword,
        },
      });
    },
    updateUser: async (_, { id, input }) => {
      return prisma.user.update({
        where: { id },
        data: input,
      });
    },
    deleteUser: async (_, { id }) => {
      return prisma.user.delete({
        where: { id },
      });
    },
  },
};
