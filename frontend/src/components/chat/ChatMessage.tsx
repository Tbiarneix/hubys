import { FC } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Message } from '@/types/message';
import { useAuth } from '@/hooks/use-auth';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const isOwnMessage = message.user.id === user?.id;

  return (
    <div
      className={`flex flex-col mb-4 ${
        isOwnMessage ? 'items-end' : 'items-start'
      }`}
    >
      <div className="flex items-center mb-1">
        <span className="text-sm text-gray-600">
          {message.user.firstName} {message.user.lastName}
        </span>
        <time
          className="text-xs text-gray-500 ml-2"
          dateTime={message.createdAt.toISOString()}
        >
          {format(new Date(message.createdAt), 'HH:mm', { locale: fr })}
        </time>
      </div>
      <div
        className={`px-4 py-2 rounded-lg max-w-[70%] ${
          isOwnMessage
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};