import { FC, useEffect, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import { ChatMessage } from './ChatMessage';
import { Message } from '@/types/message';
import { ScrollArea } from '@/components/ui/scroll-area';

const GET_GROUP_MESSAGES = gql`
  query GetGroupMessages($groupId: String!, $limit: Int, $offset: Int) {
    groupMessages(groupId: $groupId, limit: $limit, offset: $offset) {
      id
      content
      createdAt
      user {
        id
        firstName
        lastName
        avatar
      }
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnNewMessage($groupId: String!) {
    newMessage(groupId: $groupId) {
      id
      content
      createdAt
      user {
        id
        firstName
        lastName
        avatar
      }
    }
  }
`;

interface ChatMessageListProps {
  groupId: string;
}

export const ChatMessageList: FC<ChatMessageListProps> = ({ groupId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, loading, error, subscribeToMore } = useQuery(GET_GROUP_MESSAGES, {
    variables: { groupId, limit: 50 },
  });

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: MESSAGE_SUBSCRIPTION,
      variables: { groupId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.newMessage;

        return {
          groupMessages: [newMessage, ...prev.groupMessages],
        };
      },
    });

    return () => unsubscribe();
  }, [groupId, subscribeToMore]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;

  return (
    <ScrollArea ref={scrollRef} className="h-[500px] p-4">
      <div className="flex flex-col-reverse">
        {data.groupMessages.map((message: Message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
    </ScrollArea>
  );
};