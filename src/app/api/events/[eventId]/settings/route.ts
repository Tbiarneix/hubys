import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { adultShare, childShare } = body;

    const event = await prisma.event.update({
      where: {
        id: params.eventId,
      },
      data: {
        adultShare,
        childShare,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENT_SETTINGS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 