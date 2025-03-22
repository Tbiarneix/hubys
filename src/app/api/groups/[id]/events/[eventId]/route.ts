import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string; eventId: string }>
}

export async function DELETE(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est membre du groupe
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Not a member of this group" },
        { status: 403 }
      );
    }

    // Vérifier si l'événement existe et appartient au groupe
    const event = await prisma.event.findUnique({
      where: {
        id: params.eventId,
        groupId: params.id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found or not in this group" },
        { status: 404 }
      );
    }

    // Supprimer l'événement
    await prisma.event.delete({
      where: {
        id: params.eventId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est membre du groupe
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Not a member of this group" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, startDate, endDate, options } = body;

    // Vérifier si l'événement existe et appartient au groupe
    const event = await prisma.event.findUnique({
      where: {
        id: params.eventId,
        groupId: params.id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found or not in this group" },
        { status: 404 }
      );
    }

    // Mettre à jour l'événement
    const updatedEvent = await prisma.event.update({
      where: {
        id: params.eventId,
      },
      data: {
        name,
        startDate,
        endDate,
        hasRental: options.rental,
        hasMenus: options.menus,
        hasTodoList: options.shopping,
        hasActivities: options.activities,
        hasPhotos: options.photos,
        hasAccounts: options.accounts,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
