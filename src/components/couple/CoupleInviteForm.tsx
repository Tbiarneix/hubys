import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { sendInvitation } from '../../lib/services/coupleService';

interface CoupleInviteFormProps {
  onInviteSent: () => void;
}

export function CoupleInviteForm({ onInviteSent }: CoupleInviteFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendInvitation(email);
      setEmail('');
      onInviteSent();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email du partenaire
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            placeholder="partenaire@example.com"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {isLoading ? "Envoi..." : "Inviter"}
      </button>
    </form>
  );
}