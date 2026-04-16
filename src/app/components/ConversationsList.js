'use client';
import { useState, useEffect } from 'react';
import { chatAPI } from '@/lib/chatAPI';

export default function ConversationsList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = conversations.filter(conv =>
    conv.jobId.toString().includes(searchTerm)
  );

  const getStatusIcon = (status) => {
    if (status === 'seen') {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" style={{ transform: 'translateX(8px)' }} />
        </svg>
      );
    } else if (status === 'delivered') {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" style={{ transform: 'translateX(8px)' }} />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search Chats"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No chats</div>
        ) : (
          filtered.map((conv) => (
            <div
              key={conv._id}
              onClick={() => onSelectConversation(conv)}
              className="px-3 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition active:bg-gray-100 flex items-center gap-3"
            >
              {/* Avatar */}
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {conv.jobId.toString().slice(0, 1).toUpperCase()}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <p className="font-medium text-gray-900 text-sm">Job #{conv.jobId}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {conv.lastMessage && getStatusIcon(conv.lastMessageStatus)}
                    {conv.lastMessageTime && (
                      <p className="text-gray-500 text-xs">
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 text-sm truncate">{conv.lastMessage || 'No messages yet'}</p>
                  {unreadCounts[conv._id] > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 ml-2 flex-shrink-0 font-semibold">
                      {unreadCounts[conv._id]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
