"use client";

import { Calendar, Users, Image, Receipt, ShoppingCart, Gift, MessageCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface EventTabsProps {
  eventId: string;
}

export function EventTabs({ eventId }: EventTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      label: "Planning",
      icon: Calendar,
      href: `/events/${eventId}/planning`,
    },
    {
      label: "Présences",
      icon: Users,
      href: `/events/${eventId}/presence`,
    },
    {
      label: "Photos",
      icon: Image,
      href: `/events/${eventId}/photos`,
    },
    {
      label: "Dépenses",
      icon: Receipt,
      href: `/events/${eventId}/expenses`,
    },
    {
      label: "Courses",
      icon: ShoppingCart,
      href: `/events/${eventId}/shopping`,
    },
    {
      label: "Secret Santa",
      icon: Gift,
      href: `/events/${eventId}/secret-santa`,
    },
    {
      label: "Chat",
      icon: MessageCircle,
      href: `/events/${eventId}/chat`,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="max-w-screen-xl mx-auto overflow-x-auto">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={cn(
                "flex flex-col items-center py-3 px-4 text-sm transition-colors shrink-0",
                pathname === tab.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}