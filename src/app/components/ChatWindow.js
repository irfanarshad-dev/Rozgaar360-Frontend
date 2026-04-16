'use client';
import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/lib/useChat';

export default function ChatWindow({ conversationId, otherUserName, onBack }) {
  const { isConnected, messages, sendMessage, setTyping, joinConversation } = useChat();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem('userId'));
    }
  }, []);

  useEffect(() => {
    if (conversationId && isConnected && userId) {
      joinConversation(conversationId);
    }
  }, [conversationId, isConnected, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      setTyping(conversationId, true);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    sendMessage(conversationId, input);
    setInput('');
    setIsTyping(false);
    setTyping(conversationId, false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStatusIcon = (status) => {
    if (status === 'seen') {
      return (
        <svg className="w-4 h-4 text-blue-400 inline ml-1" fill="currentColor" viewBox="0 0 16 16">
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
          <path d="M13.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L7.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </svg>
      );
    } else if (status === 'delivered') {
      return (
        <svg className="w-4 h-4 text-gray-300 inline ml-1" fill="currentColor" viewBox="0 0 16 16">
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
          <path d="M13.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L7.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-300 inline ml-1" fill="currentColor" viewBox="0 0 16 16">
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </svg>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition md:hidden">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {otherUserName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{otherUserName}</p>
            <p className="text-gray-500 text-xs">{isConnected ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1M3 5a2 2 0 002 2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-gray-100">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  msg.senderId === userId
                    ? 'bg-green-500 text-white rounded-bl-lg'
                    : 'bg-white text-gray-900 rounded-br-lg shadow-sm'
                }`}
              >
                <p className="break-words">{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${msg.senderId === userId ? 'text-green-100' : 'text-gray-500'}`}>
                  <p className="text-xs">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {msg.senderId === userId && getMessageStatusIcon(msg.status)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-3 flex items-end gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
        <input
          type="text"
          value={input}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          onBlur={() => {
            setIsTyping(false);
            setTyping(conversationId, false);
          }}
          placeholder="Message"
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!isConnected || !input.trim()}
          className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0 disabled:opacity-50"
        >
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5951061 3.19218622,10.7522035 3.50612381,10.7522035 L16.6915026,11.5376905 C16.6915026,11.5376905 17.1624089,11.5376905 17.1624089,12.0089827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
