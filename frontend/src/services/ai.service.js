import api from './api';

const aiService = {
  /**
   * Convert natural language to segment rules
   * @param {String} prompt Natural language description
   * @returns {Promise<Object>} Segment rules structure
   */
  async naturalLanguageToRules(prompt) {
    return await api.post('/ai/nl-to-rules', { prompt });
  },

  /**
   * Generate message suggestions based on audience and objective
   * @param {Object} params Parameters for message generation
   * @param {String} params.segmentId ID of the audience segment
   * @param {String} params.objective Campaign objective
   * @param {String} params.tone Message tone (friendly, professional, urgent)
   * @returns {Promise<Array>} Message suggestions
   */
  async generateMessageSuggestions(params) {
    return await api.post('/ai/message-suggestions', params);
  },

  /**
   * Generate human-readable insights from campaign statistics
   * @param {String} campaignId Campaign ID
   * @returns {Promise<Object>} Insights summary
   */
  async generateCampaignInsights(campaignId) {
    return await api.get(`/ai/campaign-insights/${campaignId}`);
  },

  /**
   * Get optimal send time recommendations
   * @param {String} segmentId Segment ID
   * @returns {Promise<Object>} Send time recommendations
   */
  async getOptimalSendTime(segmentId) {
    return await api.get(`/ai/optimal-send-time/${segmentId}`);
  },

  /**
   * Generate lookalike audience based on existing segment
   * @param {String} segmentId Source segment ID
   * @returns {Promise<Object>} Lookalike audience segment rules
   */
  async generateLookalikeAudience(segmentId) {
    return await api.get(`/ai/lookalike-audience/${segmentId}`);
  },

  /**
   * Auto-tag campaign based on segment and message content
   * @param {Object} params Parameters for auto-tagging
   * @param {String} params.segmentId Segment ID
   * @param {String} params.messageContent Message content
   * @returns {Promise<Array>} Suggested tags
   */
  async autoTagCampaign(params) {
    return await api.post('/ai/auto-tag', params);
  },

  /**
   * Suggest relevant product or offer images
   * @param {Object} params Parameters for image suggestions
   * @param {String} params.messageContent Message content
   * @param {String} params.audienceType Type of audience
   * @returns {Promise<Array>} Image suggestions
   */
  async suggestImages(params) {
    return await api.post('/ai/suggest-images', params);
  },

  /**
   * Analyze audience characteristics
   * @param {String} segmentId Segment ID
   * @returns {Promise<Object>} Audience analysis
   */
  async analyzeAudience(segmentId) {
    return await api.get(`/ai/analyze-audience/${segmentId}`);
  }
};

export default aiService;