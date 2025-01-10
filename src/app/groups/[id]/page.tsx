'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Group, SecretSanta } from '@/types/group';
import Image from 'next/image';
import Link from 'next/link';
import { generateAvatarUrl } from '@/utils/avatar';
import { Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { InviteModal } from '@/components/groups/InviteModal';
import { DeleteGroupModal } from '@/components/groups/DeleteGroupModal';
import SecretSantaCard from '@/components/groups/SecretSantaCard';
import EventCard from '@/components/groups/EventCard';
import { ChatSidebar } from '@/components/groups/ChatSidebar';

export default function GroupPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [secretSanta, setSecretSanta] = useState<SecretSanta | null>(null);

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

  const handleVote = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/groups/${id}/vote`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote');
      }
      
      const updatedGroup = await response.json();
      setGroup(updatedGroup);
      toast.success('Vote enregistré');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Erreur lors du vote');
    }
  };

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
            </div>

            {/* Events section */}
            <div className="col-span-full mb-6">
              <EventCard id={id} />
            </div>
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

        {/* Chat sidebar */}
        <ChatSidebar
          groupId={id}
          messages={group.messages}
          currentUserId={session?.user?.id || ''}
          onMessagesUpdate={(messages) => setGroup(prev => prev ? { 
            ...prev, 
            messages: messages.map(msg => ({
              ...msg,
              groupId: id,
              user: {
                id: msg.user.id,
                name: msg.user.name,
                avatar: msg.user.avatar
              }
            })) 
          } : null)}
        />
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
        onVote={handleVote}
      />
    </div>
  );
}
