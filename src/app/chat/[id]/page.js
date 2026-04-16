'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth';
import ChatWindow from '../../components/ChatWindow';
import api from '@/lib/axios';

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const response = await api.get(`/api/chat/conversations/${params.id}/messages?limit=1`);
        // If we can fetch messages, conversation exists and user has access
        setConversation({ _id: params.id });
      } catch (error) {
        console.error('Failed to access conversation:', error);
        alert('You do not have access to this conversation');
        router.push('/customer/bookings');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading chat...</div>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <div className="h-screen bg-white overflow-hidden">
      <ChatWindow
        conversationId={params.id}
        otherUserName="Chat"
        onBack={() => router.back()}
      />
    </div>
  );
}
