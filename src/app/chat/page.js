'use client';
import { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import ConversationsList from '../components/ConversationsList';
import { chatAPI } from '@/lib/chatAPI';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    jobId: '507f1f77bcf86cd799439011',
    workerId: '69a97af6fa66d8ac4d46709d',
    customerId: '69a97a9ffa66d8ac4d46708f',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await chatAPI.createConversation(
        formData.jobId,
        formData.workerId,
        formData.customerId
      );
      setSelectedConversation(result.data);
      setShowCreateForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-96 flex-col bg-white border-r border-gray-200">
        {/* Header */}
        <div className="bg-white p-4 flex justify-between items-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Chats</h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
            <input
              type="text"
              placeholder="Job ID"
              value={formData.jobId}
              onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Worker ID"
              value={formData.workerId}
              onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Customer ID"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              onClick={handleCreateConversation}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded-full hover:bg-green-600 disabled:opacity-50 text-sm font-medium transition"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            {error && <p className="text-red-600 text-xs text-center">{error}</p>}
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationsList onSelectConversation={setSelectedConversation} />
        </div>
      </div>

      {/* Chat Area - Desktop */}
      <div className="hidden md:flex flex-1 flex-col bg-gray-100">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation._id}
            otherUserName={selectedConversation.workerName || 'Worker'}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="text-center">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-lg">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="md:hidden w-full flex flex-col">
        {!selectedConversation ? (
          <>
            {/* Mobile Header */}
            <div className="bg-white p-4 flex justify-between items-center border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">Chats</h1>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Mobile Create Form */}
            {showCreateForm && (
              <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
                <input
                  type="text"
                  placeholder="Job ID"
                  value={formData.jobId}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Worker ID"
                  value={formData.workerId}
                  onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Customer ID"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  onClick={handleCreateConversation}
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-2 rounded-full hover:bg-green-600 disabled:opacity-50 text-sm font-medium transition"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                {error && <p className="text-red-600 text-xs text-center">{error}</p>}
              </div>
            )}

            {/* Mobile Conversations List */}
            <div className="flex-1 overflow-y-auto">
              <ConversationsList onSelectConversation={setSelectedConversation} />
            </div>
          </>
        ) : (
          <ChatWindow
            conversationId={selectedConversation._id}
            otherUserName={selectedConversation.workerName || 'Worker'}
            onBack={() => setSelectedConversation(null)}
          />
        )}
      </div>
    </div>
  );
}
