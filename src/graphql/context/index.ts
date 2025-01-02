import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';

const prisma = new PrismaClient();

export type Context = {
  prisma: PrismaClient;
  session: Awaited<ReturnType<typeof getServerSession>> | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createContext(): Promise<Context> {
  const session = await getServerSession(authOptions);

  return {
    prisma,
    session,
  };
}
