import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(user: { id: string; email: string }) {
  return sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET) as { id: string; email: string };
  } catch (error) {
    throw new Error('Invalid token');
  }
}
