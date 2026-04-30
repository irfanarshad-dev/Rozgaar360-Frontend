import api from './axios';

export const chatAPI = {
  createConversation: (jobId, workerId, customerId) =>
    api.post('/api/chat/conversations', { jobId, workerId, customerId }),

  getConversations: () =>
    api.get('/api/chat/conversations'),

  getMessages: (conversationId, limit = 50, skip = 0) =>
    api.get(`/api/chat/conversations/${conversationId}/messages`, {
      params: { limit, skip },
    }),

  uploadFile: (file, conversationId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    return api.post('/api/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadVoice: (audioBlob, conversationId, duration) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');
    formData.append('conversationId', conversationId);
    formData.append('duration', duration.toString());
    return api.post('/api/chat/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addReaction: (messageId, emoji) =>
    api.patch(`/api/chat/messages/${messageId}/reaction`, { emoji }),

  markAsRead: (conversationId) =>
    api.patch(`/api/chat/messages/read/${conversationId}`),

  searchMessages: (conversationId, query) =>
    api.get(`/api/chat/conversations/${conversationId}/search`, {
      params: { q: query },
    }),
};
