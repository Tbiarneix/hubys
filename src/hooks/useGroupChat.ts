import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GroupMessage } from '@/types/group';

export function useGroupChat(groupId: string) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialiser la connexion socket
    socketRef.current = io({
      path: '/api/socket',
      addTrailingSlash: false,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      // Rejoindre le salon du groupe
      socket.emit('join-groups', [groupId]);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('new-message', (message: GroupMessage) => {
      if (message.groupId === groupId) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [groupId]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('send-message', {
      groupId,
      content,
    });
  }, [groupId, isConnected]);

  return {
    messages,
    isConnected,
    sendMessage,
  };
}
