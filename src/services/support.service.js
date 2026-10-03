import { apiRequest } from '../config/axios';

export const supportService = {
  /**
   * GET /api/support/tickets
   * List customer tickets and unread count
   */
  getTickets: async () => {
    try {
      const res = await apiRequest('/support/tickets', { method: 'GET' });
      return res;
    } catch (err) {
      console.warn('supportService.getTickets warning:', err.message);
      return { success: false, tickets: [], unread_count: 0 };
    }
  },

  /**
   * POST /api/support/tickets
   * Submit new support request
   */
  createTicket: async (data) => {
    return apiRequest('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * GET /api/support/tickets/{id}
   * Fetch conversation history
   */
  getTicket: async (id) => {
    return apiRequest(`/support/tickets/${id}`, { method: 'GET' });
  },

  /**
   * POST /api/support/tickets/{id}/reply
   * Post message reply to ticket
   */
  replyTicket: async (id, data) => {
    return apiRequest(`/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * POST /api/support/tickets/{id}/rate
   * Submit star rating & feedback for resolved ticket
   */
  rateTicket: async (id, data) => {
    return apiRequest(`/support/tickets/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
