"use client";

import { useShoppingList } from "@/hooks/events/use-shopping-list";
import { ShoppingCategory } from "./ShoppingCategory";
import { AddItemForm } from "./AddItemForm";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ShoppingListProps {
  eventId: string;
}

export function ShoppingList({ eventId }: ShoppingListProps) {
  const { items, categories, isLoading, addItem, toggleItem } = useShoppingList(eventId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Liste de courses</h3>
      
      <AddItemForm onAdd={addItem} categories={categories} />

      <div className="mt-8 space-y-6">
        {categories.map((category) => (
          <ShoppingCategory
            key={category}
            category={category}
            items={items.filter((item) => item.category === category)}
            onToggle={toggleItem}
          />
        ))}
      </div>
    </Card>
  );
}