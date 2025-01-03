import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// PATCH /api/wishlists/[id]/categories/[categoryId] - Update a category
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string; categoryId: string }> }
) {
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

  const wishlist = await prisma.wishList.findUnique({
    where: { id: params.id },
  });

  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  if (wishlist.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const category = await prisma.category.findUnique({
    where: { id: params.categoryId },
  });

  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  if (category.wishlistId !== params.id) {
    return NextResponse.json(
      { error: 'Category does not belong to this wishlist' },
      { status: 400 }
    );
  }

  const data = await request.json();

  const updatedCategory = await prisma.category.update({
    where: { id: params.categoryId },
    data: {
      name: data.name,
      description: data.description,
    },
  });

  return NextResponse.json(updatedCategory);
}

// DELETE /api/wishlists/[id]/categories/[categoryId] - Delete a category
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string; categoryId: string }> }
) {
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

  const wishlist = await prisma.wishList.findUnique({
    where: { id: params.id },
  });

  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  if (wishlist.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const category = await prisma.category.findUnique({
    where: { id: params.categoryId },
  });

  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  if (category.wishlistId !== params.id) {
    return NextResponse.json(
      { error: 'Category does not belong to this wishlist' },
      { status: 400 }
    );
  }

  await prisma.category.delete({
    where: { id: params.categoryId },
  });

  return new NextResponse(null, { status: 204 });
}
