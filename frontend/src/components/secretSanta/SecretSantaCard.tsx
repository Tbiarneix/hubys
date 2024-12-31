import { FC, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const GET_MY_ASSIGNMENT = gql`
  query GetMySecretSantaAssignment($groupId: String!) {
    mySecretSantaAssignment(groupId: $groupId) {
      id
      receiver {
        firstName
        lastName
      }
      secretSanta {
        year
      }
    }
  }
`;

const CREATE_SECRET_SANTA = gql`
  mutation CreateSecretSanta($groupId: String!) {
    createSecretSanta(groupId: $groupId) {
      id
      year
    }
  }
`;

interface SecretSantaCardProps {
  groupId: string;
}

export const SecretSantaCard: FC<SecretSantaCardProps> = ({ groupId }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const { data, loading, error } = useQuery(GET_MY_ASSIGNMENT, {
    variables: { groupId },
  });
  const [createSecretSanta, { loading: creating }] = useMutation(CREATE_SECRET_SANTA, {
    refetchQueries: ['GetMySecretSantaAssignment'],
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;

  const handleCreate = async () => {
    try {
      await createSecretSanta({ variables: { groupId } });
    } catch (error) {
      console.error('Erreur lors de la création du Secret Santa:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Gift className="w-8 h-8 text-primary" />
        <h3 className="text-xl font-semibold">Secret Santa {new Date().getFullYear()}</h3>
      </div>

      {data?.mySecretSantaAssignment ? (
        <div className="space-y-4">
          <p>Votre Secret Santa est prêt !</p>
          {isRevealed ? (
            <div className="p-4 bg-secondary rounded-lg">
              <p>Vous devez offrir un cadeau à :</p>
              <p className="text-lg font-semibold mt-2">
                {data.mySecretSantaAssignment.receiver.firstName}{' '}
                {data.mySecretSantaAssignment.receiver.lastName}
              </p>
            </div>
          ) : (
            <Button onClick={() => setIsRevealed(true)}>
              Révéler mon Secret Santa
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p>Aucun Secret Santa n'a encore été créé pour cette année.</p>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Création...' : 'Lancer le Secret Santa'}
          </Button>
        </div>
      )}
    </Card>
  );
};