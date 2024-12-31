"use client";

import { ShoppingItem } from "@/types/shopping";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ShoppingCategoryProps {
  category: string;
  items: ShoppingItem[];
  onToggle: (itemId: string, checked: boolean) => void;
}

export function ShoppingCategory({ category, items, onToggle }: ShoppingCategoryProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="font-medium mb-3 text-muted-foreground">{category}</h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
            />
            <label
              htmlFor={item.id}
              className={cn(
                "flex-1 cursor-pointer",
                item.checked && "line-through text-muted-foreground"
              )}
            >
              {item.name}
              {item.quantity && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({item.quantity})
                </span>
              )}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}