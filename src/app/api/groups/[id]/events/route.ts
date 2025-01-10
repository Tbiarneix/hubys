import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    const events = await prisma.event.findMany({
      where: {
        groupId: params.id,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, options, startDate, endDate } = await request.json();

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur est membre du groupe
    const groupWithMembers = await prisma.group.findFirst({
      where: {
        id: params.id,
      },
      include: {
        members: {
          include: {
            user: {
              include: {
                children: true,
                sentInvitations: {
                  include: {
                    toUser: true,
                  },
                },
                receivedInvitations: {
                  include: {
                    fromUser: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!groupWithMembers) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const member = groupWithMembers.members.find(m => m.userId === session.user.id);
    if (!member) {
      return NextResponse.json(
        { error: "Not a member of this group" },
        { status: 403 }
      );
    }

    // Calculer les sous-groupes
    const subgroups = groupWithMembers.members.map((member) => {
      const partnerFromSent = member.user.sentInvitations[0]?.toUser;
      const partnerFromReceived = member.user.receivedInvitations[0]?.fromUser;
      const partner = partnerFromSent || partnerFromReceived;

      const adults = [member.userId];
      if (partner) {
        adults.push(partner.id);
      }

      const children = member.user.children.map(child => child.id);

      return {
        adults,
        children,
        activeAdults: [...adults], // Initialement, tous les adultes sont actifs
        activeChildren: [...children], // Initialement, tous les enfants sont actifs
      };
    });

    // Filtrer les doublons de couples
    const processedPartners = new Set<string>();
    const uniqueSubgroups = subgroups.filter((subgroup) => {
      const subgroupKey = [...subgroup.adults].sort().join(',');
      if (processedPartners.has(subgroupKey)) {
        return false;
      }
      processedPartners.add(subgroupKey);
      return true;
    });

    // Créer l'événement avec les sous-groupes
    const event = await prisma.event.create({
      data: {
        name,
        groupId: params.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        hasLocation: options?.location ?? true,
        hasCalendar: options?.calendar ?? true,
        hasMenus: options?.menus ?? true,
        hasShopping: options?.shopping ?? true,
        hasActivities: options?.activities ?? true,
        hasPhotos: options?.photos ?? true,
        hasAccounts: options?.accounts ?? true,
        subgroups: {
          create: uniqueSubgroups,
        },
      },
      include: {
        subgroups: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await request.json();

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

    await prisma.event.delete({
      where: {
        id: eventId,
        groupId: params.id,
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
