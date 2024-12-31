import { FC } from 'react';
import { useQuery, gql } from '@apollo/client';
import { EventCard } from './EventCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const GET_GROUP_EVENTS = gql`
  query GetGroupEvents($groupId: String!) {
    groupEvents(groupId: $groupId) {
      id
      name
      startDate
      endDate
      participants {
        user {
          firstName
          lastName
        }
      }
    }
  }
`;

interface EventListProps {
  groupId: string;
  onCreateClick: () => void;
}

export const EventList: FC<EventListProps> = ({ groupId, onCreateClick }) => {
  const { loading, error, data } = useQuery(GET_GROUP_EVENTS, {
    variables: { groupId },
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Événements du groupe</h2>
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.groupEvents.map((event: any) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};