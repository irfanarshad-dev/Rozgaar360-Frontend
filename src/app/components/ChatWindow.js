'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/lib/useChat';
import { Send, ArrowLeft, Phone, MoreVertical, CheckCheck, Check, Shield } from 'lucide-react';

function Avatar({ name, size = 'md' }) {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sz} bg-gradient-to-br ${colors[idx]} rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

function MessageStatus({ status }) {
  if (status === 'seen') return <CheckCheck className="w-3.5 h-3.5 text-blue-300" />;
  if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-white/60" />;
  return <Check className="w-3.5 h-3.5 text-white/60" />;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({ conversationId, otherUserName, onBack }) {
  const { t, i18n } = useTranslation('common');
  const { isConnected, messages, sendMessage, setTyping, joinConversation } = useChat();
  const [input, setInput] = useState('');
  const [displayName, setDisplayName] = useState(otherUserName || t('user'));
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Read userId once and keep it stable
  const userId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId');
  }, []);

  // Join conversation & load messages
  useEffect(() => {
    if (!conversationId || !isConnected || !userId) {
      return;
    }

    console.log('[ChatWindow] Joining conversation:', conversationId);
    setLoading(true);
    
    joinConversation(conversationId).then((details) => {
      if (details) {
        const isWorker = String(details.workerId) === String(userId);
        const other = isWorker ? details.customerName : details.workerName;
        setDisplayName(other || otherUserName || t('user'));
      }
      setLoading(false);
    }).catch(err => {
      console.error('[ChatWindow] Join error:', err);
      setLoading(false);
    });

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversationId, isConnected, userId, joinConversation, otherUserName, t]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!isTypingLocal) {
      setIsTypingLocal(true);
      setTyping(conversationId, true);
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      setTyping(conversationId, false);
    }, 1500);
  };

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !isConnected) return;
    sendMessage(conversationId, text);
    setInput('');
    setIsTypingLocal(false);
    setTyping(conversationId, false);
    clearTimeout(typingTimerRef.current);
    inputRef.current?.focus();
  }, [input, isConnected, conversationId, sendMessage, setTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
     const grouped = [];
     let lastDate = null;
     messages.forEach((msg) => {
       const d = new Date(msg.createdAt).toDateString();
       if (d !== lastDate) {
         grouped.push({ type: 'date', label: d });
         lastDate = d;
       }
       grouped.push({ type: 'message', msg });
     });
     return grouped;
  }, [messages]);

  if (!conversationId) return null;

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-gray-50">

      {/* ── Header (Fixed) ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <Avatar name={displayName} size="lg" />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-base leading-tight truncate">{displayName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-500">{isConnected ? t('online') : t('offline')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Messages Area (Only Scrollable Part) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(37,99,235,0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(16,185,129,0.03) 0%, transparent 60%)' }}
      >
        {loading ? (
          <div className="flex flex-col gap-3 py-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`h-10 rounded-2xl skeleton ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
              </div>
            ))}
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 select-none">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1">{t('startConversation')}</p>
            <p className="text-sm text-gray-400 text-center max-w-xs">
              {t('privateMessagesPrompt', { name: displayName })}
            </p>
          </div>
        ) : (
          groupedMessages.map((item, idx) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${idx}`} className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] font-medium text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                    {new Date(item.label).toDateString() === new Date().toDateString()
                      ? t('today')
                      : new Date(item.label).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              );
            }

            const { msg } = item;
            const isMine = String(msg.senderId) === String(userId);
            const isTemp = String(msg._id).startsWith('temp-');

            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-scaleIn`}
              >
                <div className={`max-w-[75%] sm:max-w-[65%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                    } ${isTemp ? 'opacity-70' : ''}`}
                  >
                    <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                    {isMine && (
                      <span className={isMine ? 'text-blue-500' : ''}>
                        <MessageStatus status={msg.status} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area (Fixed at Bottom) ── */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
        {!isConnected && (
          <div className="mb-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-xs text-amber-700 font-medium">{t('reconnecting')}</span>
          </div>
        )}
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? t('messageUserPlaceholder', { name: displayName }) : t('connecting')}
              disabled={!isConnected}
              rows={1}
              className="w-full px-4 py-3 pr-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all max-h-32 scrollbar-hide disabled:opacity-60"
              style={{ lineHeight: '1.5' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!isConnected || !input.trim()}
            className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 flex-shrink-0"
          >
            <Send className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" /> {t('encrypted')}
        </p>
      </div>
    </div>
  );
}
