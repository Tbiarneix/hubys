/* eslint-disable react/no-unescaped-entities */
import { Dialog, Switch } from '@headlessui/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export function CreateEventModal({ isOpen, onClose, groupId }: CreateEventModalProps) {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const [options, setOptions] = useState({
    location: true,
    calendar: true,
    menus: true,
    shopping: true,
    activities: true,
    photos: true,
    accounts: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isCreating) return;

    try {
      setIsCreating(true);
      const response = await fetch(`/api/groups/${groupId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          hasLocation: options.location,
          hasCalendar: options.calendar,
          hasMenus: options.menus,
          hasShopping: options.shopping,
          hasActivities: options.activities,
          hasPhotos: options.photos,
          hasAccounts: options.accounts,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const event = await response.json();
      router.refresh();
      onClose();
      router.push(`/groups/${groupId}/events/${event.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const optionLabels: Record<string, string> = {
    location: 'Location',
    calendar: 'Calendrier des présences',
    menus: 'Menus',
    shopping: 'Liste de courses',
    activities: 'Activités',
    photos: 'Album photo',
    accounts: 'Comptes',
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-xl bg-white p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Créer un événement
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom de l'événement
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-sm"
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Options</h3>
              
              {Object.entries(options).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {optionLabels[key]}
                  </span>
                  <Switch
                    checked={value}
                    onChange={(checked) => setOptions(prev => ({ ...prev, [key]: checked }))}
                    className={`${
                      value ? 'bg-black' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        value ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isCreating || !name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
