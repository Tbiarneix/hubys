import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET /api/wishlists/[id]/categories - Get all categories for a wishlist
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

  const wishlist = await prisma.WishList.findUnique({
    where: { id: params.id },
  });

  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  if (wishlist.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categories = await prisma.Category.findMany({
    where: { wishlistId: params.id },
    orderBy: { order: 'asc' },
    include: {
      items: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return NextResponse.json(categories);
}

// POST /api/wishlists/[id]/categories - Create a new category
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

  const wishlist = await prisma.WishList.findUnique({
    where: { id: params.id },
  });

  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  if (wishlist.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // Get the highest order number
  const lastCategory = await prisma.Category.findFirst({
    where: { wishlistId: params.id },
    orderBy: { order: 'desc' },
  });

  const order = lastCategory ? lastCategory.order + 1 : 0;

  const category = await prisma.Category.create({
    data: {
      name,
      order,
      wishlistId: params.id,
    },
  });

  return NextResponse.json(category, { status: 201 });
}

// PATCH /api/wishlists/[id]/categories - Reorder categories
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

  const wishlist = await prisma.WishList.findUnique({
    where: { id: params.id },
  });

  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  if (wishlist.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { categories } = await request.json();

  // Update all categories in a transaction
  await prisma.$transaction(
    categories.map((cat: { id: string; order: number }) =>
      prisma.Category.update({
        where: { id: cat.id },
        data: { order: cat.order },
      })
    )
  );

  return new NextResponse(null, { status: 204 });
}
