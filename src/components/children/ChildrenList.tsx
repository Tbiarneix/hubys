import { User } from '@supabase/supabase-js';
import { Trash2 } from 'lucide-react';
import { useChildren } from '../../lib/hooks/useChildren';
import { deleteChild } from '../../lib/services/childrenService';

interface ChildrenListProps {
  user: User;
}

export function ChildrenList({ user }: ChildrenListProps) {
  const { children, loading, reloadChildren } = useChildren(user);

  if (loading) {
    return <div className="animate-pulse space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
      ))}
    </div>;
  }

  if (children.length === 0) {
    return (
      <p className="text-gray-500 italic">Aucun enfant enregistré</p>
    );
  }

  const handleDelete = async (childId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enfant ?')) {
      await deleteChild(childId);
      reloadChildren();
    }
  };

  return (
    <div className="space-y-3">
      {children.map((child) => (
        <div
          key={child.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
        >
          <div>
            <h4 className="font-medium text-gray-900">{child.first_name}</h4>
            <p className="text-sm text-gray-500">
              Né(e) le {new Date(child.birth_date).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button
            onClick={() => handleDelete(child.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Supprimer"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}