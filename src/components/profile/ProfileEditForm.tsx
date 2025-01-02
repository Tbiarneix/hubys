import { useState } from 'react';
import { X } from 'lucide-react';
import { Profile } from '../../lib/hooks/useProfile';
import { updateProfile } from '../../lib/profile';
import { CoupleSection } from '../dashboard/sections/CoupleSection';
import { ChildrenSection } from '../dashboard/sections/ChildrenSection';

interface ProfileEditFormProps {
  profile: Profile;
  onClose: () => void;
  onUpdate: (profile: Profile) => void;
}

export function ProfileEditForm({ profile, onClose, onUpdate }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    username: profile.username,
    avatar_url: profile.avatar_url || '',
    birth_date: profile.birth_date || '',
    bio: profile.bio || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'couple' | 'children'>('profile');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedProfile = await updateProfile(formData);
      onUpdate(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'profile'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Profil
            </button>
            <button
              onClick={() => setActiveTab('couple')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'couple'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Relation
            </button>
            <button
              onClick={() => setActiveTab('children')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'children'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Enfants
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
                  URL de l'avatar
                </label>
                <input
                  type="url"
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                />
              </div>

              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                  Date de naissance
                </label>
                <input
                  type="date"
                  id="birth_date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Biographie
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'couple' && (
            <CoupleSection user={profile} isEditing={true} />
          )}

          {activeTab === 'children' && (
            <ChildrenSection user={profile} isEditing={true} />
          )}
        </div>
      </div>
    </div>
  );
}