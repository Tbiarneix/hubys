import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET /api/wishlists/[id]/items - Get all items for a wishlist
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Prisma instance:', prisma);
    console.log('Available models:', Object.keys(prisma));

    const wishlist = await prisma.wishList.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { wishlistId: params.id },
      orderBy: { order: 'asc' },
      include: {
        category: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error in GET /api/wishlists/[id]/items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/wishlists/[id]/items - Create a new item
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
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

    const { name, url, comment, categoryId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get the highest order number within the category or wishlist
    const lastItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: params.id,
        categoryId: categoryId || null,
      },
      orderBy: { order: 'desc' },
    });

    const order = lastItem ? lastItem.order + 1 : 0;

    const item = await prisma.wishlistItem.create({
      data: {
        name,
        url,
        comment,
        order,
        wishlistId: params.id,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/wishlists/[id]/items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/wishlists/[id]/items - Reorder items
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
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

    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    // Update all items in a transaction
    await prisma.$transaction(
      items.map((item: { id: string; order: number; categoryId: string | null }) =>
        prisma.wishlistItem.update({
          where: { id: item.id },
          data: { 
            order: item.order,
            categoryId: item.categoryId,
          },
        })
      )
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in PATCH /api/wishlists/[id]/items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
