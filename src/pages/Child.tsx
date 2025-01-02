import { useParams } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { useChildren } from '../lib/hooks/useChildren';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChildProps {
  user: User;
}

export function Child({ user }: ChildProps) {
  const { id } = useParams();
  const { children } = useChildren(user);
  const child = children.find(child => child.id === id);

  if (!child) {
    return (
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour au tableau de bord
        </Link>
        <p className="text-gray-500">Enfant non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour au tableau de bord
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">{child.first_name}</h1>
    </div>
  );
}