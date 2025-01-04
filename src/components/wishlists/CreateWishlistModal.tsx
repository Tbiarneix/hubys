import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface CreateWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId?: string;
}

export function CreateWishlistModal({ isOpen, onClose, childId }: CreateWishlistModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChildName = async () => {
      if (childId && session?.user?.id) {
        try {
          const response = await fetch(`/api/profile/${session.user.id}/children/${childId}`);
          if (response.ok) {
            const child = await response.json();
            setTitle(`Liste de ${child.firstName}`);
          }
        } catch (error) {
          console.error('Error fetching child:', error);
        }
      } else {
        setTitle(`Liste de ${session?.user?.name || 'souhaits'}`);
      }
    };

    fetchChildName();
  }, [childId, session?.user?.id, session?.user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/wishlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title,
          childId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create wishlist');
      }

      const wishlist = await response.json();
      router.push(`/wishlists/${wishlist.id}`);
      onClose();
    } catch (error) {
      console.error('Error creating wishlist:', error);
      // Here you could add proper error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg p-6 w-[90vw] max-w-[450px] shadow-lg z-50">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Créer une nouvelle liste
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Titre de la liste
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-sm"
                placeholder="Ma liste de souhaits"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
