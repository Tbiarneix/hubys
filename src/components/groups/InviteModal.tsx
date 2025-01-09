/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export function InviteModal({ isOpen, onClose, groupId }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateInviteLink = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite link');
      }

      const { token } = await response.json();
      const link = `${window.location.origin}/groups/join/${token}`;
      setInviteLink(link);
    } catch (error) {
      console.error('Error generating invite link:', error);
      toast.error('Erreur lors de la génération du lien');
    }
  };

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      toast.success('Invitation envoyée avec succès');
      setEmail('');
      onClose();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Lien copié dans le presse-papier');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg p-6 w-[90vw] max-w-[450px] shadow-lg z-50">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              Inviter des membres
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleEmailInvite}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Inviter par email
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-gray-800"
                    placeholder="email@example.com"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Ou partager un lien d'invitation
              </p>
              {inviteLink ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-800"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateInviteLink}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Générer un lien d'invitation
                </button>
              )}
              {inviteLink && (
                <p className="text-xs text-gray-500 mt-2">
                  Ce lien expirera dans 48 heures
                </p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
