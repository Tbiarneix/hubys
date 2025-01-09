import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOgData } from "@/lib/og";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { eventId, url, amount } = await req.json();

    // Get OG data from URL
    const ogData = await getOgData(url);

    const location = await prisma.location.create({
      data: {
        eventId,
        url,
        amount,
        title: ogData.title || url,
        image: ogData.image || "",
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error creating location:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
