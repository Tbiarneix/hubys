import { useState } from 'react';
import { Baby } from 'lucide-react';
import { addChild } from '../../lib/services/childrenService';
import type { CoupleWithPartner } from '../../lib/hooks/useCouple';

interface AddChildFormProps {
  couple: CoupleWithPartner;
  onChildAdded: () => void;
}

export function AddChildForm({ couple, onChildAdded }: AddChildFormProps) {
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addChild({
        first_name: firstName,
        birth_date: birthDate,
        couple_id: couple.id
      });
      setFirstName('');
      setBirthDate('');
      onChildAdded();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          Prénom
        </label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
          Date de naissance
        </label>
        <input
          type="date"
          id="birthDate"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
      >
        <Baby className="h-4 w-4 mr-2" />
        {isLoading ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}