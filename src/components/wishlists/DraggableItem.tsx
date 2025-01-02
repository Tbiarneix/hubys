import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Link as LinkIcon, Trash2 } from 'lucide-react';

interface DraggableItemProps {
  id: string;
  name: string;
  url?: string | null;
  comment?: string | null;
  onDelete?: () => void;
  isOwner: boolean;
}

export function DraggableItem({ id, name, url, comment, onDelete, isOwner }: DraggableItemProps) {
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
      <div className="flex items-start gap-3">
        {isOwner && (
          <button
            {...attributes}
            {...listeners}
            className="mt-1 p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-gray-800 font-medium">{name}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                </a>
              )}
              {isOwner && onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1 hover:bg-gray-100 rounded text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          {comment && <p className="mt-1 text-sm text-gray-500">{comment}</p>}
        </div>
      </div>
    </div>
  );
}
