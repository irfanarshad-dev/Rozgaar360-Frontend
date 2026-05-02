'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/lib/useChat';
import { Send, ArrowLeft, MoreVertical, CheckCheck, Check, Shield, Paperclip, X, Download, FileText } from 'lucide-react';
import NotificationPermissionBanner from './NotificationPermissionBanner';

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
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';

  if (src) {
    return (
      <div className={`${sz} rounded-2xl overflow-hidden flex-shrink-0 shadow-md bg-white ring-1 ring-gray-100`}>
        <img
          src={src}
          alt={name || 'Chat avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

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

export default function ChatWindow({ conversationId, otherUserName, otherUserProfilePicture, onBack }) {
  const { t, i18n } = useTranslation('common');
  const { isConnected, messages, sendMessage, setTyping, joinConversation, deleteMessage } = useChat();
  const [input, setInput] = useState('');
  const [displayName, setDisplayName] = useState(otherUserName || t('user'));
  const [displayPicture, setDisplayPicture] = useState(otherUserProfilePicture || null);
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const deleteMenuRef = useRef(null);
  const longPressTimerRef = useRef(null);

  const userId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId');
  }, []);

  // Close delete menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteMenuRef.current && !deleteMenuRef.current.contains(event.target)) {
        setShowDeleteMenu(null);
      }
    };

    if (showDeleteMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDeleteMenu]);

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
        const picture = isWorker ? details.customerProfilePicture : details.workerProfilePicture;
        setDisplayName(other || otherUserName || t('user'));
        setDisplayPicture(picture || otherUserProfilePicture || null);
      }
      setLoading(false);
    }).catch(err => {
      console.error('[ChatWindow] Join error:', err);
      setLoading(false);
    });

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversationId, isConnected, userId, joinConversation, otherUserName, otherUserProfilePicture, t]);

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

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760');
    if (file.size > maxSize) {
      alert('File must be under 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only images, PDF and Word files allowed');
      return;
    }

    setFilePreview({ file, url: URL.createObjectURL(file), type: file.type });
  };

  const handleSendFile = async () => {
    if (!filePreview || !isConnected || uploading) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', filePreview.file);
      formData.append('conversationId', conversationId);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('[ChatWindow] File uploaded:', data);
      
      // Clear preview - socket event will handle message display
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('File upload error:', error);
      alert('Upload failed, please try again');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelFile = () => {
    if (filePreview?.url) URL.revokeObjectURL(filePreview.url);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLongPressStart = (messageId) => {
    longPressTimerRef.current = setTimeout(() => {
      setShowDeleteMenu(messageId);
    }, 500); // 500ms long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleDeleteMessage = async (messageId, deleteForEveryone = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deleteForEveryone }),
        }
      );

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      deleteMessage(messageId, deleteForEveryone);
      setShowDeleteMenu(null);
    } catch (error) {
      console.error('Delete message error:', error);
      alert('Failed to delete message');
    }
  };

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
      <div className="bg-white border-b border-gray-100 shadow-sm px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <Avatar name={displayName} src={displayPicture} size="lg" />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm sm:text-base leading-tight truncate">{displayName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-[10px] sm:text-xs text-gray-500">{isConnected ? t('online') : t('offline')}</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* ── Messages Area (Only Scrollable Part) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-1 scrollbar-thin"
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

            // Debug log for file messages
            if (msg.messageType === 'file' || msg.fileUrl) {
              console.log('[ChatWindow] Rendering file message:', {
                messageType: msg.messageType,
                fileUrl: msg.fileUrl,
                fileName: msg.fileName,
                fileType: msg.fileType,
              });
            }

            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-scaleIn group relative`}
              >
                <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Delete menu - only for own messages */}
                  {isMine && !isTemp && showDeleteMenu === msg._id && (
                    <div 
                      ref={deleteMenuRef}
                      className="absolute -top-2 right-8 sm:right-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[160px] sm:min-w-[180px]"
                    >
                      <button
                        onClick={() => handleDeleteMessage(msg._id, false)}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Delete for me
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg._id, true)}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Delete for everyone
                      </button>
                    </div>
                  )}

                  {/* Three dots menu button - only for own messages and not deleted */}
                  {isMine && !isTemp && !msg.deletedForMe && !msg.deletedForEveryone && (
                    <button
                      onClick={() => setShowDeleteMenu(showDeleteMenu === msg._id ? null : msg._id)}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 hover:bg-gray-300 rounded-full p-1"
                    >
                      <MoreVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                    </button>
                  )}

                  <div
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      (msg.deletedForMe || msg.deletedForEveryone)
                        ? 'bg-gray-100 border border-gray-200'
                        : isMine
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                    } ${isTemp ? 'opacity-70' : ''}`}
                    onTouchStart={() => isMine && !isTemp && !msg.deletedForMe && !msg.deletedForEveryone && handleLongPressStart(msg._id)}
                    onTouchEnd={handleLongPressEnd}
                    onTouchCancel={handleLongPressEnd}
                  >
                    {/* File Message */}
                    {(msg.messageType === 'file' || msg.fileUrl) && !msg.deletedForMe && !msg.deletedForEveryone && (
                      <div className={msg.text ? 'mb-2' : ''}>
                        {msg.fileType === 'image' ? (
                          <img
                            src={msg.fileUrl}
                            alt={msg.fileName || 'Image'}
                            className="max-w-[160px] sm:max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setLightboxImage(msg.fileUrl)}
                          />
                        ) : (
                          <div className={`${isMine ? 'bg-blue-500' : 'bg-gray-100'} rounded-lg p-2 sm:p-3 flex items-center gap-2`}>
                            <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${isMine ? 'text-white' : msg.fileType === 'pdf' ? 'text-red-500' : 'text-blue-500'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-[10px] sm:text-xs font-medium truncate ${isMine ? 'text-white' : 'text-gray-700'}`}>{msg.fileName || 'File'}</p>
                              <p className={`text-[10px] sm:text-xs ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>{msg.fileSize ? (msg.fileSize / 1024).toFixed(1) + ' KB' : ''}</p>
                            </div>
                            <a href={msg.fileUrl} download target="_blank" rel="noopener noreferrer" className={`p-1 rounded ${isMine ? 'hover:bg-blue-600' : 'hover:bg-gray-200'}`}>
                              <Download className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isMine ? 'text-white' : 'text-gray-600'}`} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Text Message */}
                    {msg.text && !msg.deletedForMe && !msg.deletedForEveryone && <p className="break-words whitespace-pre-wrap">{msg.text}</p>}
                    
                    {/* Deleted message indicator */}
                    {(msg.deletedForMe || msg.deletedForEveryone) && (
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs italic text-gray-500">
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>
                          {msg.deletedForEveryone ? 'This message was deleted' : 'You deleted this message'}
                        </span>
                      </div>
                    )}
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

      {/* ── Notification Permission Banner ── */}
      <NotificationPermissionBanner />

      {/* ── Input Area (Fixed at Bottom) ── */}
      <div className="bg-white border-t border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 flex-shrink-0">
        {/* File Preview */}
        {filePreview && (
          <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              {filePreview.type.startsWith('image/') ? (
                <img src={filePreview.url} alt="Preview" className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{filePreview.file.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{(filePreview.file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={handleCancelFile} disabled={uploading} className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-3">
              <button onClick={handleCancelFile} disabled={uploading} className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs sm:text-sm font-medium disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSendFile} disabled={uploading} className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Send File'}
              </button>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="mb-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-xs text-amber-700 font-medium">{t('reconnecting')}</span>
          </div>
        )}
        <div className="flex items-end gap-2 sm:gap-3">
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || filePreview}
            className="p-2 sm:p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-40 flex-shrink-0"
            style={{ minWidth: '40px', minHeight: '40px' }}
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? t('messageUserPlaceholder', { name: displayName }) : t('connecting')}
              disabled={!isConnected}
              rows={1}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-3 sm:pr-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all max-h-32 scrollbar-hide disabled:opacity-60"
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
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 flex-shrink-0"
          >
            <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
        <p className="text-[9px] sm:text-[10px] text-gray-400 text-center mt-1.5 sm:mt-2 flex items-center justify-center gap-1">
          <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {t('encrypted')}
        </p>
      </div>

      {/* ── Image Lightbox Modal ── */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Download button */}
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const response = await fetch(lightboxImage);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `rozgaar360-image-${Date.now()}.jpg`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error('Download failed:', error);
              }
            }}
            className="absolute top-4 left-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
          >
            <Download className="w-6 h-6" />
          </button>

          {/* Image */}
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            style={{ touchAction: 'pinch-zoom' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
