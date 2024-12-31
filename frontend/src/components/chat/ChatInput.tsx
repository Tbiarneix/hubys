import { FC, useState, KeyboardEvent } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SEND_MESSAGE = gql`
  mutation SendMessage($groupId: String!, $content: String!) {
    sendMessage(groupId: $groupId, content: $content) {
      id
      content
      createdAt
    }
  }
`;

interface ChatInputProps {
  groupId: string;
}

export const ChatInput: FC<ChatInputProps> = ({ groupId }) => {
  const [content, setContent] = useState('');
  const [sendMessage] = useMutation(SEND_MESSAGE);

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      await sendMessage({
        variables: { groupId, content: content.trim() },
      });
      setContent('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Écrivez votre message..."
        className="flex-1"
        aria-label="Message"
      />
      <Button
        onClick={handleSend}
        disabled={!content.trim()}
        aria-label="Envoyer"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};