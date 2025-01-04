import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  hasVoted: boolean;
  votePercentage: number;
  onVote: () => void;
}

export function DeleteGroupModal({
  isOpen,
  onClose,
  groupId,
  hasVoted,
  votePercentage,
  onVote,
}: DeleteGroupModalProps) {
  const handleVote = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/vote-deletion`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to vote for deletion');
      }

      onVote();
      toast.success('Vote enregistré');
    } catch (error) {
      console.error('Error voting for deletion:', error);
      toast.error('Erreur lors de l\'enregistrement du vote');
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg p-6 w-[90vw] max-w-[450px] shadow-lg z-50">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Supprimer le groupe
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              La suppression du groupe nécessite l'approbation d'au moins 50% des membres.
              Une fois supprimé, toutes les données du groupe seront définitivement perdues.
            </p>

            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Votes pour la suppression
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {votePercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${votePercentage}%` }}
                />
              </div>
            </div>

            {!hasVoted ? (
              <button
                onClick={handleVote}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Voter pour la suppression
              </button>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                Vous avez déjà voté pour la suppression
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
