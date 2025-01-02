import { User } from '@supabase/supabase-js';
import { Check, X } from 'lucide-react';
import { useCouple } from '../../lib/hooks/useCouple';
import { acceptInvitation, rejectInvitation } from '../../lib/services/coupleService';

interface CoupleInvitationsProps {
  user: User;
}

export function CoupleInvitations({ user }: CoupleInvitationsProps) {
  const { couples, loading, reloadCouples } = useCouple(user);

  const handleAccept = async (coupleId: string) => {
    await acceptInvitation(coupleId);
    reloadCouples();
  };

  const handleReject = async (coupleId: string) => {
    await rejectInvitation(coupleId);
    reloadCouples();
  };

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded-lg"></div>;
  }

  const pendingInvitations = couples.filter(
    couple => couple.status === 'en_attente' && couple.user2_id === user.id
  );

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Invitations en attente</h3>
      <div className="space-y-2">
        {pendingInvitations.map((couple) => (
          <div
            key={couple.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
          >
            <div>
              <p className="font-medium text-gray-900">{couple.partner.username}</p>
              <p className="text-sm text-gray-500">souhaite vous ajouter comme partenaire</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAccept(couple.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                aria-label="Accepter"
              >
                <Check className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleReject(couple.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                aria-label="Refuser"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}