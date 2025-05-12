import api from './api';

const segmentService = {
  /**
   * Get all segments
   * @returns {Promise<Array>} List of segments
   */
  async getAllSegments() {
    return await api.get('/segments');
  },

  /**
   * Get segment by ID
   * @param {String} id Segment ID
   * @returns {Promise<Object>} Segment data
   */
  async getSegmentById(id) {
    return await api.get(`/segments/${id}`);
  },

  /**
   * Create a new segment
   * @param {Object} segmentData Segment data
   * @returns {Promise<Object>} Created segment
   */
  async createSegment(segmentData) {
    return await api.post('/segments', segmentData);
  },

  /**
   * Update an existing segment
   * @param {String} id Segment ID
   * @param {Object} segmentData Updated segment data
   * @returns {Promise<Object>} Updated segment
   */
  async updateSegment(id, segmentData) {
    return await api.put(`/segments/${id}`, segmentData);
  },

  /**
   * Delete a segment
   * @param {String} id Segment ID
   * @returns {Promise<Object>} Response
   */
  async deleteSegment(id) {
    return await api.delete(`/segments/${id}`);
  },

  /**
   * Preview audience size for a segment with improved error handling
   * @param {Object} rulesData Segment rules data
   * @returns {Promise<Object>} Audience preview data
   */
  async previewSegment(rulesData) {
    try {
      // Ensure we have the right structure for the API
      const payload = rulesData.rules ? rulesData : { rules: rulesData };
      
      // Deep validation of the rules structure
      if (!this.validateRules(payload.rules)) {
        return { count: 0 };
      }
      
      // Format the rules correctly for the backend
      const formattedPayload = this.formatRulesForBackend(payload);
      
      // Only log in development to prevent excessive console logs in production
      if (process.env.NODE_ENV === 'development') {
        console.log('Preview request:', JSON.stringify(formattedPayload));
      }
      
      // Set longer timeout for preview requests
      const options = { timeout: 10000 }; // 10 seconds
      
      try {
        const response = await api.post('/segments/preview', formattedPayload, options);
        
        // Handle response with safe property access
        const count = this.extractCountFromResponse(response);
        return { count };
      } catch (error) {
        console.error('API Error in previewSegment:', error.message);
        // Return 0 count with error status
        return { count: 0, error: error.message };
      }
    } catch (error) {
      console.error('Error preparing preview request:', error.message);
      return { count: 0, error: 'Invalid request format' };
    }
  },

  /**
   * Validates that rules are complete and correctly structured
   * @param {Object} rules Rules object to validate
   * @returns {Boolean} Whether rules are valid
   */
  validateRules(rules) {
    // Check for required structure
    if (!rules || !rules.conditions || !Array.isArray(rules.conditions) || rules.conditions.length === 0) {
      return false;
    }
    
    // Ensure conditionType is valid
    if (!rules.conditionType || !['AND', 'OR'].includes(rules.conditionType)) {
      return false;
    }
    
    // Check each condition for completeness
    for (const condition of rules.conditions) {
      if (!condition.field || !condition.operator || condition.value === undefined || condition.value === '') {
        return false;
      }
    }
    
    return true;
  },

  /**
   * Format rules into the structure expected by the backend
   * @param {Object} payload The original payload
   * @returns {Object} Formatted payload
   */
  formatRulesForBackend(payload) {
    // If the payload is already in the right format, return it as is
    if (payload.rules && payload.rules.conditions) {
      return payload;
    }
    
    // If not, ensure it's correctly structured
    return {
      rules: {
        conditionType: payload.conditionType || 'AND',
        conditions: Array.isArray(payload.conditions) ? payload.conditions : []
      }
    };
  },

  /**
   * Safely extract count from various response formats
   * @param {Object} response The API response
   * @returns {Number} The audience count
   */
  extractCountFromResponse(response) {
    if (!response) return 0;
    
    // Try different paths to find the count property
    if (typeof response.count === 'number') {
      return response.count;
    } else if (response.data && typeof response.data.count === 'number') {
      return response.data.count;
    } else if (response.data && response.data.data && typeof response.data.data.count === 'number') {
      return response.data.data.count;
    }
    
    // If we have an array of customers, use its length
    if (response.data && response.data.data && Array.isArray(response.data.data.sampleCustomers)) {
      return response.data.data.sampleCustomers.length;
    }
    
    return 0;
  },

  /**
   * Refresh the audience size for a segment
   * @param {String} id Segment ID
   * @returns {Promise<Object>} Updated segment with refreshed audience size
   */
  async refreshSegmentSize(id) {
    return await api.post(`/segments/${id}/refresh`);
  },

  /**
   * Convert natural language to segment rules
   * @param {String} prompt Natural language prompt
   * @returns {Promise<Object>} Generated rules
   */
  async convertNLToRules(prompt) {
    return await api.post('/ai/segment-rules', { prompt });
  },

  /**
   * Get segment performance metrics
   * @param {String} id Segment ID
   * @returns {Promise<Object>} Performance metrics
   */
  async getSegmentPerformance(id) {
    return await api.get(`/segments/${id}/performance`);
  }
};

export default segmentService;