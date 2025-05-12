import api from './api';

const campaignService = {
  /**
   * Get all campaigns with pagination
   * @param {Number} page Page number
   * @param {Number} limit Items per page
   * @returns {Promise<Object>} Paginated campaigns list
   */
  async getAllCampaigns(page = 1, limit = 10) {
    return await api.get('/campaigns', { params: { page, limit } });
  },

  /**
   * Get campaign by ID
   * @param {String} id Campaign ID
   * @returns {Promise<Object>} Campaign data
   */
  async getCampaignById(id) {
    return await api.get(`/campaigns/${id}`);
  },

  /**
   * Create a new campaign
   * @param {Object} campaignData Campaign data
   * @returns {Promise<Object>} Created campaign
   */
  async createCampaign(campaignData) {
    return await api.post('/campaigns', campaignData);
  },

  /**
   * Update an existing campaign
   * @param {String} id Campaign ID
   * @param {Object} campaignData Updated campaign data
   * @returns {Promise<Object>} Updated campaign
   */
  async updateCampaign(id, campaignData) {
    return await api.put(`/campaigns/${id}`, campaignData);
  },

  /**
   * Delete a campaign
   * @param {String} id Campaign ID
   * @returns {Promise<Object>} Response
   */
  async deleteCampaign(id) {
    return await api.delete(`/campaigns/${id}`);
  },

  /**
   * Get campaign delivery statistics
   * @param {String} id Campaign ID
   * @returns {Promise<Object>} Delivery statistics
   */
  async getCampaignStats(id) {
    return await api.get(`/campaigns/${id}/stats`);
  },

  /**
   * Get campaign communication logs
   * @param {String} id Campaign ID
   * @param {Number} page Page number
   * @param {Number} limit Items per page
   * @returns {Promise<Object>} Communication logs
   */
  async getCampaignLogs(id, page = 1, limit = 100) {
    return await api.get(`/campaigns/${id}/logs`, { params: { page, limit } });
  },

  /**
   * Generate AI message suggestions for campaign
   * @param {String} segmentId Segment ID
   * @param {String} objective Campaign objective
   * @returns {Promise<Array>} Message suggestions
   */
  async getMessageSuggestions(segmentId, objective) {
    return await api.post('/ai/message-suggestions', { segmentId, objective });
  },

  /**
   * Generate AI campaign performance insights
   * @param {String} campaignId Campaign ID
   * @returns {Promise<Object>} Campaign insights
   */
  async getCampaignInsights(campaignId) {
    return await api.get(`/ai/campaign-insights/${campaignId}`);
  },

  /**
   * Get optimal send time suggestions
   * @param {String} segmentId Segment ID
   * @returns {Promise<Object>} Optimal send time data
   */
  async getOptimalSendTime(segmentId) {
    return await api.get(`/ai/optimal-send-time/${segmentId}`);
  },

  /**
   * Test a campaign with sample data
   * @param {Object} campaignData Campaign data to test
   * @returns {Promise<Object>} Test results
   */
  async testCampaign(campaignData) {
    return await api.post('/campaigns/test', campaignData);
  },

  /**
   * Deliver a campaign by its ID
   * @param {string} campaignId - The ID of the campaign to deliver
   * @returns {Promise} - Axios response promise
   */
  async deliverCampaign(campaignId) {
    if (!campaignId) {
      throw new Error('Campaign ID is required to deliver a campaign');
    }
    const response = await api.post(`/campaigns/${campaignId}/deliver`);
    return response.data;
  }
};

export default campaignService;