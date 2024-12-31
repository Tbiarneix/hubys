import { MiddlewareFn } from 'type-graphql';
import { verify } from 'jsonwebtoken';
import { Context } from '../types/context';

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];
  if (!authorization) throw new Error('Non authentifié');

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.JWT_SECRET || 'secret');
    context.payload = payload as any;
  } catch (err) {
    throw new Error('Non authentifié');
  }

  return next();
};