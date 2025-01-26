import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { rentalId, value } = await req.json();

    // Check if user already voted
    const existingVote = await prisma.rentalVote.findFirst({
      where: {
        rentalId,
        userId: session.user.id,
      },
    });

    if (existingVote) {
      // Update existing vote
      const vote = await prisma.rentalVote.update({
        where: { id: existingVote.id },
        data: { value },
      });
      return NextResponse.json(vote);
    } else {
      // Create new vote
      const vote = await prisma.rentalVote.create({
        data: {
          rentalId,
          userId: session.user.id,
          value,
        },
      });
      return NextResponse.json(vote);
    }
  } catch (error) {
    console.error("Error voting for rental:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
