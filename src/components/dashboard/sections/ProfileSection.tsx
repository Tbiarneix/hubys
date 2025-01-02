import { Profile } from '../../../lib/hooks/useProfile';
import { ProfileCard } from '../../profile/ProfileCard';
import { ProfileEditForm } from '../../profile/ProfileEditForm';

interface ProfileSectionProps {
  profile: Profile;
  isEditing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onUpdate: (profile: Profile) => void;
}

export function ProfileSection({
  profile,
  isEditing,
  onEdit,
  onClose,
  onUpdate
}: ProfileSectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Mon profil</h2>
      <ProfileCard profile={profile} onEdit={onEdit} />
      
      {isEditing && (
        <ProfileEditForm
          profile={profile}
          onClose={onClose}
          onUpdate={onUpdate}
        />
      )}
    </section>
  );
}