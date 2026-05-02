'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { chatAPI } from '@/lib/chatAPI';
import { Search, MessageSquare, Clock } from 'lucide-react';

function timeAgo(dateStr, language, t) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('justNow');
  if (mins < 60) return t('minutesAgo', { count: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('hoursAgo', { count: hrs });
  const days = Math.floor(hrs / 24);
  if (days < 7) return t('daysAgo', { count: days });
  return new Date(dateStr).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric' });
}

function Avatar({ name, src, size = 'md' }) {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  const sizeClass = size === 'lg' ? 'w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg' : 'w-10 h-10 sm:w-11 sm:h-11 text-xs sm:text-sm';

  if (src) {
    return (
      <div className={`${sizeClass} rounded-2xl overflow-hidden flex-shrink-0 shadow-md bg-white ring-1 ring-gray-100`}>
        <img
          src={src}
          alt={name || 'Conversation avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} bg-gradient-to-br ${colors[idx]} rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

export default function ConversationsList({ onSelectConversation, selectedId }) {
  const { t, i18n } = useTranslation('common');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadConversations = useCallback(async () => {
    // Don't make API calls if not authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await chatAPI.getConversations();
      const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

      const convs = (res.data || []).map((conv) => {
        const workerIdStr =
          typeof conv.workerId === 'object' && conv.workerId?._id
            ? String(conv.workerId._id)
            : String(conv.workerId || '');
        const customerIdStr =
          typeof conv.customerId === 'object' && conv.customerId?._id
            ? String(conv.customerId._id)
            : String(conv.customerId || '');

        const workerName =
          typeof conv.workerId === 'object' ? conv.workerId?.name || t('workerLabel') : t('workerLabel');
        const customerName =
          typeof conv.customerId === 'object' ? conv.customerId?.name || t('customerLabel') : t('customerLabel');
        const workerProfilePicture =
          typeof conv.workerId === 'object' ? conv.workerId?.profilePicture || null : null;
        const customerProfilePicture =
          typeof conv.customerId === 'object' ? conv.customerId?.profilePicture || null : null;

        const isWorker = workerIdStr === String(currentUserId);
        const otherParticipantName = isWorker ? customerName : workerName;
        const otherParticipantId = isWorker ? customerIdStr : workerIdStr;
        const otherParticipantProfilePicture = isWorker ? customerProfilePicture : workerProfilePicture;

        return {
          ...conv,
          _id: String(conv._id),
          otherParticipantName,
          otherParticipantId,
          otherParticipantProfilePicture,
        };
      });

      setConversations(convs);
    } catch (err) {
      // Silently fail for network errors — don't crash the UI
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.warn('[ConversationsList] Could not load conversations:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadConversations();
    
    // Real-time refresh
    const handleUpdate = () => loadConversations();
    window.addEventListener('chat:conversation-updated', handleUpdate);
    
    const interval = setInterval(loadConversations, 30000); // Poll less frequently now that we have sockets
    return () => {
      clearInterval(interval);
      window.removeEventListener('chat:conversation-updated', handleUpdate);
    };
  }, [loadConversations]);

  const filtered = conversations.filter((c) =>
    c.otherParticipantName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="h-10 skeleton rounded-xl mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 skeleton rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="h-3 skeleton rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-2.5 sm:p-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('searchConversations')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 px-4 sm:px-6 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">{t('noConversationsYet')}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{t('startChatFromProfile')}</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv._id === selectedId;
            const unreadCount = conv.unreadCount && currentUserId ? conv.unreadCount[currentUserId] || 0 : 0;

            return (
              <button
                key={conv._id}
                onClick={() => {
                  if (unreadCount > 0) {
                    setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: { ...c.unreadCount, [currentUserId]: 0 } } : c));
                  }
                  onSelectConversation(conv);
                }}
                className={`w-full text-left px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-2.5 sm:gap-3 transition-all duration-150 border-b border-gray-50 hover:bg-blue-50/60 group ${
                  isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="relative">
                   <Avatar name={conv.otherParticipantName} src={conv.otherParticipantProfilePicture} />
                   <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <p className={`text-xs sm:text-sm font-semibold truncate ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                      {conv.otherParticipantName || t('user')}
                    </p>
                    {conv.lastMessageTime && (
                      <span className="text-[10px] sm:text-[11px] text-gray-400 flex-shrink-0 ml-2 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {timeAgo(conv.lastMessageTime, i18n.language, t)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[10px] sm:text-xs truncate flex-1 ${conv.lastMessage ? 'text-gray-500' : 'text-gray-400 italic'}`}>
                      {conv.lastMessage || t('noMessagesYet')}
                    </p>
                    {unreadCount > 0 && !isActive && (
                      <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] sm:min-w-[18px] flex items-center justify-center shadow-sm animate-scaleIn">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
