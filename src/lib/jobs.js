import api from './axios';

export const jobsService = {
  // Fetch worker's bookings (these are the "jobs" for workers)
  async getWorkerJobs(status = null) {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/api/bookings/my-bookings', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch worker jobs:', error);
      throw error;
    }
  },

  // Get all available bookings (pending status) - these are job opportunities
  async getAvailableJobs(params = {}) {
    try {
      const response = await api.get('/api/bookings/my-bookings', { 
        params: { status: 'pending', ...params } 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available jobs:', error);
      throw error;
    }
  },

  // Accept a booking (job)
  async acceptJob(bookingId) {
    try {
      const response = await api.put(`/api/bookings/${bookingId}/status`, {
        status: 'confirmed'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to accept job:', error);
      throw error;
    }
  },

  // Get worker stats from bookings
  async getWorkerStats() {
    try {
      const response = await api.get('/api/bookings/my-bookings');
      const bookings = response.data;
      
      const stats = {
        totalJobs: bookings.length,
        pendingJobs: bookings.filter(b => b.status === 'pending').length,
        completedJobs: bookings.filter(b => b.status === 'completed').length,
        inProgressJobs: bookings.filter(b => b.status === 'in_progress').length,
        confirmedJobs: bookings.filter(b => b.status === 'confirmed').length,
      };
      
      return stats;
    } catch (error) {
      console.error('Failed to fetch worker stats:', error);
      throw error;
    }
  },

  // Get single booking details
  async getJobDetails(bookingId) {
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      throw error;
    }
  },

  // Update booking status
  async updateJobStatus(bookingId, status, cancellationReason = null) {
    try {
      const payload = { status };
      if (cancellationReason) {
        payload.cancellationReason = cancellationReason;
      }
      const response = await api.put(`/api/bookings/${bookingId}/status`, payload);
      return response.data;
    } catch (error) {
      console.error('Failed to update job status:', error);
      throw error;
    }
  },

  // Update booking amount
  async updateJobAmount(bookingId, estimatedCost) {
    try {
      const response = await api.put(`/api/bookings/${bookingId}`, { estimatedCost });
      return response.data;
    } catch (error) {
      console.error('Failed to update job amount:', error);
      throw error;
    }
  }
};
