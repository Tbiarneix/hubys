import { User } from '@supabase/supabase-js';
import { useCouple } from '../../lib/hooks/useCouple';
import { CoupleInviteForm } from './CoupleInviteForm';
import { endRelationship } from '../../lib/services/coupleService';

interface CoupleStatusProps {
  user: User;
  isEditing?: boolean;
}

export function CoupleStatus({ user, isEditing }: CoupleStatusProps) {
  const { couples, loading, reloadCouples } = useCouple(user);

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded-lg"></div>;
  }

  // On ne considère comme actif que les couples où les deux partenaires sont différents
  const activeCouple = couples.find(
    couple => couple.status === 'accepte' && couple.user1_id !== couple.user2_id
  );

  const handleEndRelationship = async () => {
    if (!activeCouple) return;

    if (window.confirm('Êtes-vous sûr de vouloir mettre fin à cette relation ? Cette action est irréversible.')) {
      await endRelationship(activeCouple.id);
      reloadCouples();
    }
  };

  if (activeCouple) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Votre partenaire</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={activeCouple.partner.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${activeCouple.partner.username}`}
              alt={`Avatar de ${activeCouple.partner.username}`}
              className="w-12 h-12 rounded-full bg-gray-100"
            />
            <div>
              <p className="font-medium text-gray-900">{activeCouple.partner.username}</p>
              <p className="text-sm text-gray-500">En couple depuis le {new Date(activeCouple.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          {isEditing && (
            <button
              onClick={handleEndRelationship}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              Mettre fin à la relation
            </button>
          )}
        </div>
      </div>
    );
  }

  // Si l'utilisateur est célibataire, on affiche toujours le formulaire d'invitation
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Inviter votre partenaire</h3>
      <CoupleInviteForm onInviteSent={reloadCouples} />
    </div>
  );
}