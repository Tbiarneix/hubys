/* eslint-disable react/no-unescaped-entities */
import { Dialog, Switch } from '@headlessui/react';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LocationAutocomplete } from '../LocationAutocomplete';

interface UpdateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  eventId: string;
  initialData: {
    name: string;
    startDate: Date;
    endDate: Date;
    location: string | undefined;
    options: {
      rental: boolean;
      menus: boolean;
      shopping: boolean;
      activities: boolean;
      photos: boolean;
      accounts: boolean;
    };
  };
}

export function UpdateEventModal({ isOpen, onClose, groupId, eventId, initialData }: UpdateEventModalProps) {
  const [name, setName] = useState(initialData.name);
  const [startDate, setStartDate] = useState(initialData.startDate);
  const [endDate, setEndDate] = useState(initialData.endDate);
  const [location, setLocation] = useState(initialData.location || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const [options, setOptions] = useState(initialData.options);

  useEffect(() => {
    if (isOpen) {
      setName(initialData.name);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setLocation(initialData.location || '');
      setOptions(initialData.options);
    }
  }, [isOpen, initialData]);

  console.log(startDate.toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate || isUpdating) return;

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("La date de début doit être antérieure à la date de fin");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/groups/${groupId}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          startDate: startDate,
          endDate: endDate,
          location: location || null,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      toast.success("Événement mis à jour avec succès");
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("Erreur lors de la mise à jour de l'événement");
    } finally {
      setIsUpdating(false);
    }
  };

  const optionLabels: Record<string, string> = {
    rental: 'Location',
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
              Modifier l'événement
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

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Localisation (optionnel)
              </label>
              <LocationAutocomplete
                value={location}
                onChange={setLocation}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Date de début
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate.toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(new Date(e.target.value + 'T12:00:00'))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  Date de fin
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate.toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(new Date(e.target.value + 'T12:00:00'))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-sm"
                  required
                />
              </div>
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
                disabled={isUpdating || !name.trim() || !startDate || !endDate}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
