import { FC, useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CREATE_GROUP = gql`
  mutation CreateGroup($name: String!) {
    createGroup(name: $name) {
      id
      name
    }
  }
`;

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateGroupDialog: FC<CreateGroupDialogProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [createGroup] = useMutation(CREATE_GROUP, {
    refetchQueries: ['GetMyGroups'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGroup({ variables: { name } });
      onClose();
      setName('');
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Créer un nouveau groupe</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom du groupe
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom du groupe"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};