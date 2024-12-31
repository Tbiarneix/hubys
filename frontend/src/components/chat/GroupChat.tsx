import { FC } from 'react';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';

interface GroupChatProps {
  groupId: string;
}

export const GroupChat: FC<GroupChatProps> = ({ groupId }) => {
  return (
    <div className="flex flex-col h-full border rounded-lg">
      <ChatMessageList groupId={groupId} />
      <ChatInput groupId={groupId} />
    </div>
  );
};