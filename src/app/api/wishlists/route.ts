import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET /api/wishlists - Get all wishlists for the current user
export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const wishlists = await prisma.wishList.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(wishlists);
}

// POST /api/wishlists - Create a new wishlist
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { title, description } = await request.json();

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const wishlist = await prisma.wishList.create({
    data: {
      title,
      description,
      userId: user.id,
    },
  });

  return NextResponse.json(wishlist, { status: 201 });
}
