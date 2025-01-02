/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    users: async () => {
      return prisma.user.findMany();
    },
    user: async (_: any, { id }: { id: string }) => {
      return prisma.user.findUnique({
        where: { id },
      });
    },
    me: async (_: any, __: any, { user }: { user: any }) => {
      if (!user) return null;
      return prisma.user.findUnique({
        where: { id: user.id },
      });
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: any }) => {
      const hashedPassword = await hash(input.password, 10);
      return prisma.user.create({
        data: {
          ...input,
          password: hashedPassword,
        },
      });
    },
    updateUser: async (_: any, { id, input }: { id: string, input: any }) => {
      return prisma.user.update({
        where: { id },
        data: input,
      });
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      return prisma.user.delete({
        where: { id },
      });
    },
  },
};
