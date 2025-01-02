import { Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Profile } from '../../lib/hooks/useProfile';
import { useCouple } from '../../lib/hooks/useCouple';
import { useChildren } from '../../lib/hooks/useChildren';

interface ProfileCardProps {
  profile: Profile;
  onEdit: () => void;
}

export function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  const { couples, loading: loadingCouple } = useCouple(profile);
  const { children, loading: loadingChildren } = useChildren(profile);

  const activeCouple = couples?.find(
    couple => couple.status === 'accepte' && couple.user1_id !== couple.user2_id
  );

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
              alt={`Avatar de ${profile.username}`}
              className="w-20 h-20 rounded-full bg-gray-100"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{profile.username}</h2>
              {profile.birth_date && (
                <p className="text-sm text-gray-500">
                  Né(e) le {new Date(profile.birth_date).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Modifier le profil"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>

        {profile.bio && (
          <div className="mt-4">
            <p className="text-gray-600 whitespace-pre-line">{profile.bio}</p>
          </div>
        )}

        {!loadingCouple && !loadingChildren && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Statut relationnel</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {activeCouple ? (
                    <span>En couple avec {activeCouple.partner.username}</span>
                  ) : (
                    <span>Célibataire</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Enfants</dt>
                <dd className="mt-1 text-sm space-y-1">
                  {children.length > 0 ? (
                    children.map(child => (
                      <Link
                        key={child.id}
                        to={`/child/${child.id}`}
                        className="block text-gray-900 hover:text-gray-600"
                      >
                        {child.first_name}
                      </Link>
                    ))
                  ) : (
                    <span className="text-gray-900">Aucun enfant</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}