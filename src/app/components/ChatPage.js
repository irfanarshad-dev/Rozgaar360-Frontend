'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import ChatWindow from './ChatWindow';
import ConversationsList from './ConversationsList';
import { chatAPI } from '@/lib/chatAPI';
import { ChatProvider } from '@/lib/useChat';
import { authService } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import {
  MessageCircle, ArrowLeft, X, Loader2, Sparkles, Shield, Zap,
} from 'lucide-react';

// ── Empty state ────────────────────────────────────────────────
function EmptyState() {
  const { t } = useTranslation('common');

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 p-8 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-floatY">
          <MessageCircle className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
        Rozgaar<span className="text-blue-600">360</span> {t('messages')}
      </h2>
      <p className="text-gray-500 max-w-xs mb-8 text-sm leading-relaxed">
        {t('selectConversationHint')}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { icon: Shield, label: t('encrypted') },
          { icon: Zap,    label: t('realtimeDelivery') },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-sm font-medium text-gray-600">
            <Icon className="w-3.5 h-3.5 text-blue-500" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inner page (needs search params + client-only state) ───────
function ChatPageInner({ embedded = false }) {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId');

  const [selectedConv, setSelectedConv]   = useState(null);
  const [creating, setCreating]           = useState(false);
  const [error, setError]                 = useState('');
  const [user, setUser]                   = useState(null);
  // mounted flag — prevents any localStorage-dependent UI from rendering on server
  const [mounted, setMounted]             = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = authService.getUser();
    setUser(u);
    if (u?._id) localStorage.setItem('userId', u._id);
  }, []);

  // Auto-create conversation if workerId query param is present
  useEffect(() => {
    if (workerId && user && mounted) {
      createConversationWith(workerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId, user, mounted]);

  const createConversationWith = async (wId) => {
    setCreating(true);
    setError('');
    try {
      const currentUserId = user?._id || localStorage.getItem('userId');
      if (!currentUserId) throw new Error('Not authenticated');

      const result = await chatAPI.createConversation('', wId, currentUserId);
      const conv = result.data;

      const workerIdStr   = typeof conv.workerId   === 'object' ? String(conv.workerId?._id   || conv.workerId)   : String(conv.workerId);
      const customerIdStr = typeof conv.customerId === 'object' ? String(conv.customerId?._id || conv.customerId) : String(conv.customerId);
      const defaultWorker = t('workerLabel');
      const defaultCustomer = t('customerLabel');
      const workerName = typeof conv.workerId === 'object' ? conv.workerId?.name || defaultWorker : defaultWorker;
      const customerName = typeof conv.customerId === 'object' ? conv.customerId?.name || defaultCustomer : defaultCustomer;

      const isWorker = workerIdStr === String(currentUserId);
      conv.otherParticipantName = isWorker ? customerName : workerName;
      conv._id = String(conv._id);

      setSelectedConv(conv);
    } catch (err) {
      console.error('[ChatPage] Create conversation error:', err);
      setError(err.response?.data?.message || t('chatStartFailed'));
    } finally {
      setCreating(false);
    }
  };

  const handleSelectConversation = (conv) => setSelectedConv(conv);
  const handleBack = () => setSelectedConv(null);

  // ── Render a stable skeleton until the client is mounted ─────
  if (!mounted) {
    return (
      <div className={`flex overflow-hidden bg-gray-50 ${embedded ? 'h-full' : 'h-[100dvh]'}`}>
        <div className="flex flex-col bg-white border-r border-gray-100 w-80 lg:w-96 flex-shrink-0">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="h-7 skeleton rounded-xl w-32 mb-2" />
            <div className="h-4 skeleton rounded-xl w-24" />
          </div>
          <div className="p-4 space-y-4">
            <div className="h-10 skeleton rounded-xl" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-11 h-11 skeleton rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex overflow-hidden bg-gray-50 ${embedded ? 'h-full' : 'h-[100dvh]'}`}>

      {/* ── Sidebar ── */}
      <aside className={`
        flex flex-col bg-white border-r border-gray-100 shadow-sm flex-shrink-0
        transition-all duration-300 ease-in-out
        ${selectedConv ? 'hidden md:flex md:w-80 lg:w-96' : 'flex w-full md:w-80 lg:w-96'}
      `}>

        {/* Header */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="md:hidden p-1.5 sm:p-2 -ml-1.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">{t('messages')}</h1>
                {user && (
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 capitalize" suppressHydrationWarning>
                    {t(`role.${user.role}`, { defaultValue: user.role })} · {user.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-xs font-medium text-emerald-600">{t('live')}</span>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-red-50 border border-red-100 rounded-xl text-[10px] sm:text-xs text-red-700 animate-scaleIn">
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')} className="hover:text-red-900">
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          )}

          {/* Creating indicator */}
          {creating && (
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[10px] sm:text-xs text-blue-700 animate-scaleIn mt-2">
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
              {t('openingConversation')}
            </div>
          )}
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-hidden">
          <ConversationsList
            onSelectConversation={handleSelectConversation}
            selectedId={selectedConv?._id}
          />
        </div>

        {/* User strip */}
        {user && (
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-gray-100 bg-gray-50/50 flex items-center gap-2 sm:gap-3 flex-shrink-0" suppressHydrationWarning>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md" suppressHydrationWarning>
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate" suppressHydrationWarning>{user.name}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 capitalize" suppressHydrationWarning>{t(`role.${user.role}`, { defaultValue: user.role })}</p>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main chat area ── */}
      <main className={`flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
        {selectedConv ? (
          <ChatWindow
            key={selectedConv._id}
            conversationId={selectedConv._id}
            otherUserName={selectedConv.otherParticipantName || t('name')}
            onBack={handleBack}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

// ── Root: wrap in ChatProvider + Suspense ─────────────────────
export default function ChatPage({ embedded = false }) {
  const { t } = useTranslation('common');

  return (
    <ChatProvider>
      <Suspense fallback={
        <div className={`flex items-center justify-center bg-gray-50 ${embedded ? 'h-full' : 'h-[100dvh]'}`}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">{t('loadingMessages')}</p>
          </div>
        </div>
      }>
        <ChatPageInner embedded={embedded} />
      </Suspense>
    </ChatProvider>
  );
}
