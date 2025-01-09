/* eslint-disable react/no-unescaped-entities */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Link as LinkIcon, Trash2, Pencil, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DraggableItemProps {
  id: string;
  name: string;
  url?: string | null;
  comment?: string | null;
  onDelete?: () => void;
  onEdit?: () => void;
  onResetReservation?: () => void;
  isOwner: boolean;
}

export function DraggableItem({ 
  id, 
  name, 
  url, 
  comment, 
  onDelete, 
  onEdit, 
  onResetReservation,
  isOwner 
}: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-lg border ${
        isDragging ? 'border-black shadow-lg' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        {isOwner && (
          <button
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className="text-gray-800 font-medium truncate">{name}</h3>
              {comment && (
                <span className="text-sm text-gray-500 truncate">• {comment}</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {url && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded w-6 h-6"
                      >
                        <LinkIcon className="h-4 w-4 text-gray-500" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voir l'article</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isOwner && onEdit && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onEdit}
                        className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded w-6 h-6 text-gray-500"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Modifier l'article</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isOwner && onResetReservation && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onResetReservation}
                        className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded w-6 h-6 text-gray-500"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Réinitialiser l'état de la réservation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isOwner && onDelete && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onDelete}
                        className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded w-6 h-6 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Supprimer l'article</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
