import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { locationId, value } = await req.json();

    // Check if user already voted
    const existingVote = await prisma.locationVote.findFirst({
      where: {
        locationId,
        userId: session.user.id,
      },
    });

    if (existingVote) {
      // Update existing vote
      const vote = await prisma.locationVote.update({
        where: { id: existingVote.id },
        data: { value },
      });
      return NextResponse.json(vote);
    } else {
      // Create new vote
      const vote = await prisma.locationVote.create({
        data: {
          locationId,
          userId: session.user.id,
          value,
        },
      });
      return NextResponse.json(vote);
    }
  } catch (error) {
    console.error("Error voting for location:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
