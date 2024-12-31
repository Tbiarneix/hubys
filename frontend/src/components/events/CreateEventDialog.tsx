"use client";

import { FC, useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';

const CREATE_EVENT = gql`
  mutation CreateEvent(
    $name: String!
    $startDate: DateTime!
    $endDate: DateTime!
    $isVacation: Boolean!
    $groupId: String
  ) {
    createEvent(
      name: $name
      startDate: $startDate
      endDate: $endDate
      isVacation: $isVacation
      groupId: $groupId
    ) {
      id
      name
      startDate
      endDate
    }
  }
`;

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  groupId?: string;
}

export const CreateEventDialog: FC<CreateEventDialogProps> = ({ 
  open, 
  onClose, 
  groupId 
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isVacation, setIsVacation] = useState(false);

  const [createEvent] = useMutation(CREATE_EVENT, {
    refetchQueries: ['GetGroupEvents'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    try {
      await createEvent({
        variables: {
          name,
          startDate,
          endDate,
          isVacation,
          groupId,
        },
      });
      onClose();
      setName('');
      setStartDate(undefined);
      setEndDate(undefined);
      setIsVacation(false);
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Créer un nouvel événement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom de l'événement
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom de l'événement"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de début
              </label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de fin
              </label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isVacation}
              onCheckedChange={setIsVacation}
              id="vacation-mode"
            />
            <label htmlFor="vacation-mode" className="text-sm font-medium">
              Vacances en location
            </label>
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