import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@headlessui/react';
import { Group } from '@/types/group';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onGroupUpdate: (updatedGroup: Group) => void;
}

export function EditGroupModal({ isOpen, onClose, group, onGroupUpdate }: EditGroupModalProps) {
  const router = useRouter();
  const [name, setName] = useState(group.name);
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState({
    events: group.showEvents,
    secretSanta: group.showSecretSanta,
    recipes: group.showRecipes,
    calendar: group.showCalendar,
  });

  useEffect(() => {
    setName(group.name);
    setCards({
      events: group.showEvents,
      secretSanta: group.showSecretSanta,
      recipes: group.showRecipes,
      calendar: group.showCalendar,
    });
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim()) {
      toast.error("Le nom du groupe est requis");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(),
          showEvents: cards.events,
          showSecretSanta: cards.secretSanta,
          showRecipes: cards.recipes,
          showCalendar: cards.calendar,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update group');
      }

      const updatedGroup = await response.json();
      onGroupUpdate(updatedGroup);
      router.refresh();
      toast.success('Groupe modifié avec succès');
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error("Une erreur est survenue lors de la modification du groupe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-900/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-100 p-8 text-gray-900 shadow">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold">
              Modifier le groupe
            </Dialog.Title>
            <button
              className="rounded-full p-1 hover:bg-gray-200"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nom du groupe
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Entrez le nom du groupe"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-m font-medium text-gray-700">
                Options à afficher
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Événements</span>
                  <Switch
                    checked={cards.events}
                    onChange={(checked) => setCards(c => ({ ...c, events: checked }))}
                    className={`${
                      cards.events ? 'bg-gray-900' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        cards.events ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Secret Santa</span>
                  <Switch
                    checked={cards.secretSanta}
                    onChange={(checked) => setCards(c => ({ ...c, secretSanta: checked }))}
                    className={`${
                      cards.secretSanta ? 'bg-gray-900' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        cards.secretSanta ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Recettes</span>
                  <Switch
                    checked={cards.recipes}
                    onChange={(checked) => setCards(c => ({ ...c, recipes: checked }))}
                    className={`${
                      cards.recipes ? 'bg-gray-900' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        cards.recipes ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Calendrier</span>
                  <Switch
                    checked={cards.calendar}
                    onChange={(checked) => setCards(c => ({ ...c, calendar: checked }))}
                    className={`${
                      cards.calendar ? 'bg-gray-900' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        cards.calendar ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-gray-800 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                'Modifier les informations du groupe'
              )}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
