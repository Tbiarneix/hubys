"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useChildren } from "@/hooks/use-children";

export function ChildrenList() {
  const { children, removeChild } = useChildren();

  if (children.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        Aucun enfant ajouté
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {children.map((child) => (
        <li
          key={child.id}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div>
            <p className="font-medium">{child.name}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(child.birthDate), "d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeChild(child.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}