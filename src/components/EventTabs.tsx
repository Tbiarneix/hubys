/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteEventModal } from "./groups/DeleteEventModal";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Event {
  id: string;
  hasLocation: boolean;
  hasCalendar: boolean;
  hasMenus: boolean;
  hasShopping: boolean;
  hasActivities: boolean;
  hasPhotos: boolean;
  hasAccounts: boolean;
}

interface EventTabsProps {
  event: Event;
  groupId: string;
}

export default function EventTabs({ event, groupId }: EventTabsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const pathname = usePathname() ?? '';

  const tabStyle = (isActive: boolean) =>
    `px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  const basePath = `/groups/${groupId}/events/${event.id}`;

  return (
    <div className="w-full">
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 flex gap-2 overflow-x-auto">
        <Link
          href={basePath}
          className={tabStyle(pathname === basePath)}
        >
          Vue d'ensemble
        </Link>
        {event.hasLocation && (
          <Link
            href={`${basePath}/location`}
            className={tabStyle(pathname.includes("/location"))}
          >
            Location
          </Link>
        )}
        {event.hasCalendar && (
          <Link
            href={`${basePath}/calendar`}
            className={tabStyle(pathname.includes("/calendar"))}
          >
            Calendrier des présences
          </Link>
        )}
        {event.hasMenus && (
          <Link
            href={`${basePath}/menus`}
            className={tabStyle(pathname.includes("/menus"))}
          >
            Menus
          </Link>
        )}
        {event.hasShopping && (
          <Link
            href={`${basePath}/shopping`}
            className={tabStyle(pathname.includes("/shopping"))}
          >
            Liste de courses
          </Link>
        )}
        {event.hasActivities && (
          <Link
            href={`${basePath}/activities`}
            className={tabStyle(pathname.includes("/activities"))}
          >
            Activités
          </Link>
        )}
        {event.hasPhotos && (
          <Link
            href={`${basePath}/photos`}
            className={tabStyle(pathname.includes("/photos"))}
          >
            Album photo
          </Link>
        )}
        {event.hasAccounts && (
          <Link
            href={`${basePath}/accounts`}
            className={tabStyle(pathname.includes("/accounts"))}
          >
            Comptes
          </Link>
        )}
        <div className="ml-auto">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <DeleteEventModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        eventId={event.id}
        groupId={groupId}
      />
    </div>
  );
}
