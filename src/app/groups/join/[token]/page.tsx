'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function JoinGroupPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const joinGroup = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/groups/join/${params.token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to join group');
        }

        const member = await response.json();
        toast.success('Vous avez rejoint le groupe avec succès');
        router.push(`/groups/${member.groupId}`);
      } catch (error) {
        console.error('Error joining group:', error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Erreur lors de la tentative de rejoindre le groupe');
        }
        router.push('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    joinGroup();
  }, [params.token, router, session?.user?.id]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-900">Chargement...</p>
      </div>
    );
  }

  return null;
}
