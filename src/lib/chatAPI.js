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
};
