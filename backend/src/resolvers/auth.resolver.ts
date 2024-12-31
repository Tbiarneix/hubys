import { Resolver, Mutation, Arg } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AuthResponse } from '../types/auth';

const prisma = new PrismaClient();

@Resolver()
export class AuthResolver {
  @Mutation(() => AuthResponse)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Arg('firstName') firstName: string,
    @Arg('lastName', { nullable: true }) lastName?: string,
  ): Promise<AuthResponse> {
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    const token = sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });

    return { token, user };
  }

  @Mutation(() => AuthResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
  ): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Utilisateur non trouvé');

    const valid = await compare(password, user.password);
    if (!valid) throw new Error('Mot de passe incorrect');

    const token = sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });

    return { token, user };
  }
}