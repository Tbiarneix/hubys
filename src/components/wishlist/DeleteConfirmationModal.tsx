import { Modal } from '../ui/Modal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName 
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmer la suppression"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Supprimer
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-500">
        Êtes-vous sûr de vouloir supprimer "{itemName}" ? Cette action est irréversible.
      </p>
    </Modal>
  );
}