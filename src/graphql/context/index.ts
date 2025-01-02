import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export type Context = {
  prisma: PrismaClient;
  req: NextApiRequest;
  res: NextApiResponse;
  user?: {
    id: string;
    email: string;
  };
};

export async function createContext({ req, res }): Promise<Context> {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  let user;
  if (token) {
    try {
      user = await verifyToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  }

  return {
    prisma,
    req,
    res,
    user,
  };
}
