'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { chatAPI } from './chatAPI';

export function useChat() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const currentConversationRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socketRef.current = io('http://localhost:3001/chat', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));

    socketRef.current.on('message-received', (message) => {
      if (message.conversationId === currentConversationRef.current) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketRef.current.on('user-typing', (data) => {
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        if (data.isTyping) {
          updated.add(data.userId);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });
    });

    socketRef.current.on('user-online', (data) => {
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    });

    socketRef.current.on('user-offline', (data) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const joinConversation = async (conversationId) => {
    currentConversationRef.current = conversationId;
    socketRef.current?.emit('join-conversation', { conversationId });
    
    try {
      const response = await chatAPI.getMessages(conversationId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = (conversationId, text, fileUrls) => {
    socketRef.current?.emit('send-message', { conversationId, text, fileUrls });
  };

  const setTyping = (conversationId, isTyping) => {
    socketRef.current?.emit('typing', { conversationId, isTyping });
  };

  const markMessageSeen = (messageId) => {
    socketRef.current?.emit('message-seen', { messageId });
  };

  const leaveConversation = (conversationId) => {
    socketRef.current?.emit('leave-conversation', { conversationId });
    currentConversationRef.current = null;
  };

  return {
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    joinConversation,
    sendMessage,
    setTyping,
    markMessageSeen,
    leaveConversation,
  };
}
