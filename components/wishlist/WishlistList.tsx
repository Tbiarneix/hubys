"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { WishlistItem } from "./WishlistItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WishlistDialog } from "./WishlistDialog";
import { useWishlist } from "@/hooks/use-wishlist";

export function WishlistList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { items, addItem, removeItem, reorderItems } = useWishlist();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    reorderItems(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Ma liste de souhaits</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un article
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="wishlist">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <WishlistItem
                        item={item}
                        onRemove={removeItem}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <WishlistDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={addItem}
      />
    </div>
  );
}