'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { Group } from '@/types/group';
import Image from 'next/image';
import Link from 'next/link';
import { generateAvatarUrl } from '@/utils/avatar';
import { MessageSquare, Share2, Trash2, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { InviteModal } from '@/components/groups/InviteModal';
import { DeleteGroupModal } from '@/components/groups/DeleteGroupModal';
import { DeleteMessageModal } from '@/components/groups/DeleteMessageModal';
import SecretSantaCard from '@/components/groups/SecretSantaCard';

export default function GroupPage({ params }: { params: { id: string } }) {
  const id = use(params).id;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [secretSanta, setSecretSanta] = useState<any>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!session?.user?.id) return;

      try {
        const [groupResponse, secretSantaResponse] = await Promise.all([
          fetch(`/api/groups/${id}`),
          fetch(`/api/groups/${id}/secret-santa`),
        ]);

        if (!groupResponse.ok) {
          throw new Error('Failed to fetch group');
        }

        const [groupData, secretSantaData] = await Promise.all([
          groupResponse.json(),
          secretSantaResponse.ok ? secretSantaResponse.json() : null,
        ]);

        setGroup(groupData);
        setSecretSanta(secretSantaData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
        router.push('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroup();
  }, [id, session?.user?.id, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !newMessage.trim()) return;

    try {
      const response = await fetch(`/api/groups/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const message = await response.json();
      setGroup(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
      } : null);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/groups/${id}/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      const updatedMessage = await response.json();
      setGroup(prev => prev ? {
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        ),
      } : null);
      toast.success('Message supprimé');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression du message');
    }
  };

  const handleLaunchSecretSanta = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/secret-santa`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to launch Secret Santa');
      }

      const data = await response.json();
      setSecretSanta(data);
      toast.success('Secret Santa lancé avec succès !');
    } catch (error) {
      console.error('Error launching Secret Santa:', error);
      throw error;
    }
  };

  const handleRelaunchSecretSanta = async () => {
    try {
      await handleCancelSecretSanta();
      await handleLaunchSecretSanta();
    } catch (error) {
      console.error('Error relaunching Secret Santa:', error);
      throw error;
    }
  };

  const handleCancelSecretSanta = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/secret-santa`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel Secret Santa');
      }

      setSecretSanta(null);
      toast.success('Secret Santa annulé');
    } catch (error) {
      console.error('Error canceling Secret Santa:', error);
      throw error;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-900">Chargement...</p>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const hasVotedForDeletion = group.deletionVotes.includes(session?.user?.id || '');
  const deleteVotePercentage = (group.deletionVotes.length / group.members.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Main content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-black">{group.name}</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Inviter
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </button>
              </div>
            </div>

            {/* Members grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {group.members
                .sort((a, b) => a.user.name.localeCompare(b.user.name))
                .map((member) => (
                  <Link
                    key={member.id}
                    href={`/profile/${member.userId}`}
                    className="block p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={member.user.avatar || generateAvatarUrl(member.user.name)}
                          alt={member.user.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {member.user.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Membre depuis {format(new Date(member.joinedAt), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="col-span-full mb-6">
                <SecretSantaCard
                  groupId={id}
                  groupName={group.name}
                  currentUserId={session?.user?.id || ''}
                  secretSanta={secretSanta}
                  onLaunch={handleLaunchSecretSanta}
                  onRelaunch={handleRelaunchSecretSanta}
                  onCancel={handleCancelSecretSanta}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chat sidebar */}
        <div className="w-96 border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat de groupe
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {group.messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={message.user.avatar || generateAvatarUrl(message.user.name)}
                    alt={message.user.name}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-start justify-between">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {message.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(message.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    {message.userId === session?.user?.id && !message.isDeleted && (
                      <button
                        onClick={() => setMessageToDelete(message.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${message.isDeleted ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-gray-800"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modales */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={id}
      />
      <DeleteGroupModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        groupId={id}
        hasVoted={hasVotedForDeletion}
        votePercentage={deleteVotePercentage}
      />
      <DeleteMessageModal
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={() => {
          if (messageToDelete) {
            handleDeleteMessage(messageToDelete);
          }
        }}
      />
    </div>
  );
}
