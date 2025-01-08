import { format } from 'date-fns';
// import { fr } from 'date-fns/locale/fr';
import { MessageSquare, Send, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { generateAvatarUrl } from '@/utils/avatar';
import { DeleteMessageModal } from '@/components/groups/DeleteMessageModal';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  isDeleted: boolean;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface ChatSidebarProps {
  groupId: string;
  messages: Message[];
  currentUserId: string;
  onMessagesUpdate: (messages: Message[]) => void;
}

export function ChatSidebar({ groupId, messages, currentUserId, onMessagesUpdate }: ChatSidebarProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !newMessage.trim()) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
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
      onMessagesUpdate([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUserId) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      const updatedMessage = await response.json();
      onMessagesUpdate(
        messages.map(msg => msg.id === messageId ? updatedMessage : msg)
      );
      toast.success('Message supprimé');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression du message');
    }
  };

  return (
    <div className="w-96 border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Chat de groupe
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
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
                {message.userId === currentUserId && !message.isDeleted && (
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

      <DeleteMessageModal
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={() => {
          if (messageToDelete) {
            handleDeleteMessage(messageToDelete);
            setMessageToDelete(null);
          }
        }}
      />
    </div>
  );
}
