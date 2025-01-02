import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface WishlistCommentProps {
  comment: string | null;
  onSave: (comment: string | null) => Promise<void>;
  placeholder?: string;
}

export function WishlistComment({ comment, onSave, placeholder }: WishlistCommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(editedComment || null);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-2 py-1 text-sm border rounded-md focus:ring-1 focus:ring-gray-400"
        />
        <button
          onClick={() => setIsEditing(false)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </button>
        <button
          onClick={handleSave}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (!comment) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        {placeholder}
      </button>
    );
  }

  return (
    <div className="group relative text-sm text-gray-600">
      <span>{comment}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  );
}