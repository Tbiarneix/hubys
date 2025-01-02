import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { Gift } from 'lucide-react';
import { WishlistSection as WishlistContent } from '../../wishlist/WishlistSection';

interface WishlistSectionProps {
  user: User;
}

export function WishlistSection({ user }: WishlistSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <section>
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-white p-6 rounded-lg border border-gray-200 flex items-center justify-between hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Gift className="h-6 w-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Ma liste de souhaits</h2>
          </div>
          <span className="text-sm text-gray-500">Gérer ma liste →</span>
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(false)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Retour au dashboard
        </button>
      </div>
      
      <WishlistContent user={user} />
    </section>
  );
}