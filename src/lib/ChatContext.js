'use client';
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { chatAPI } from './chatAPI';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const currentConvRef = useRef(null);

  // ── Connect socket once ──────────────────────────────────────
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const socket = io('http://127.0.0.1:3001/chat', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Chat] ✓ Connected:', socket.id);
      setIsConnected(true);
      // Re-join current conversation after reconnect
      if (currentConvRef.current) {
        socket.emit('join-conversation', { conversationId: currentConvRef.current });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('[Chat] Connection error:', err.message);
      setIsConnected(false);
    });

    socket.on('disconnect', () => {
      console.log('[Chat] Disconnected');
      setIsConnected(false);
    });

    socket.on('message-received', (message) => {
      console.log('[Chat] message-received:', message);
      console.log('[Chat] File fields:', {
        messageType: message.messageType,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileType: message.fileType,
      });
      setMessages((prev) => {
        const msgConvId = String(message.conversationId);
        const curConvId = currentConvRef.current ? String(currentConvRef.current) : null;

        // Ignore messages for other conversations
        if (curConvId && msgConvId !== curConvId) return prev;

        // Replace temp message (match text + senderId)
        const tempIdx = prev.findIndex(
          (m) =>
            String(m._id).startsWith('temp-') &&
            m.text === message.text &&
            String(m.senderId) === String(message.senderId)
        );
        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = { ...message, _id: String(message._id) };
          return updated;
        }

        // Avoid true duplicates
        if (prev.some((m) => String(m._id) === String(message._id))) return prev;

        return [...prev, { ...message, _id: String(message._id) }];
      });
    });

    socket.on('user-typing', (data) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (data.isTyping) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    });

    socket.on('conversation-updated', (data) => {
      console.log('[Chat] conversation-updated:', data);
      window.dispatchEvent(new CustomEvent('chat:conversation-updated', { detail: data }));
    });

    socket.on('message-deleted', (data) => {
      console.log('[Chat] message-deleted:', data);
      setMessages((prev) => {
        return prev.map((msg) => {
          if (String(msg._id) === String(data.messageId)) {
            if (data.deleteForEveryone) {
              return { ...msg, deletedForEveryone: true, text: '', fileUrl: null, fileName: null };
            } else {
              return { ...msg, deletedForMe: true };
            }
          }
          return msg;
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Join a conversation & load history ─────────────────────
  const joinConversation = useCallback(async (conversationId) => {
    const convId = String(conversationId);
    currentConvRef.current = convId;
    setMessages([]);

    if (socketRef.current?.connected) {
      socketRef.current.emit('join-conversation', { conversationId: convId });
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;

    try {
      const res = await chatAPI.getMessages(convId);
      const data = res.data;
      const msgs = (data?.messages || data || []).map((m) => ({
        ...m,
        _id: String(m._id),
        senderId: String(m.senderId),
        conversationId: String(m.conversationId),
      }));
      setMessages(msgs);
      return data?.conversation || null;
    } catch (err) {
      console.error('[Chat] Failed to load messages:', err.message);
      return null;
    }
  }, []);

  // ── Send a message ─────────────────────────────────────────
  const sendMessage = useCallback((conversationId, text, fileUrls) => {
    if (!text?.trim()) return;
    const convId = String(conversationId);
    const senderId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    const temp = {
      _id: `temp-${Date.now()}`,
      conversationId: convId,
      senderId: String(senderId),
      text,
      fileUrls: fileUrls || [],
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, temp]);
    socketRef.current?.emit('send-message', { conversationId: convId, text, fileUrls });
  }, []);

  // ── Typing indicator ───────────────────────────────────────
  const setTyping = useCallback((conversationId, isTyping) => {
    socketRef.current?.emit('typing', { conversationId: String(conversationId), isTyping });
  }, []);

  // ── Leave conversation ─────────────────────────────────────
  const leaveConversation = useCallback((conversationId) => {
    socketRef.current?.emit('leave-conversation', { conversationId: String(conversationId) });
    currentConvRef.current = null;
    setMessages([]);
  }, []);

  // ── Delete message ─────────────────────────────────────────
  const deleteMessage = useCallback((messageId, deleteForEveryone = false) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('delete-message', {
        messageId,
        conversationId: currentConvRef.current,
        deleteForEveryone,
      });
    }
  }, []);

  return (
    <ChatContext.Provider value={{
      isConnected,
      messages,
      typingUsers,
      joinConversation,
      sendMessage,
      setTyping,
      leaveConversation,
      deleteMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
}
