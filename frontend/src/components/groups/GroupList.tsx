import { FC } from 'react';
import { useQuery, gql } from '@apollo/client';
import { GroupCard } from './GroupCard';
import { Group } from '@/types/group';

const GET_MY_GROUPS = gql`
  query GetMyGroups {
    myGroups {
      id
      name
      members {
        id
        user {
          id
          firstName
          lastName
          avatar
        }
        joinedAt
      }
    }
  }
`;

export const GroupList: FC = () => {
  const { loading, error, data } = useQuery(GET_MY_GROUPS);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.myGroups.map((group: Group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
};