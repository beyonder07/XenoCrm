import { useState, useCallback } from 'react';
import { aiService } from '../services/ai.service';
import { toast } from 'react-toastify';

/**
 * Custom hook for AI features
 * @returns {Object} AI methods and state
 */
const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Generate message suggestions
   * @param {Object} params - Parameters for message generation
   * @returns {Promise<Array>} Generated message suggestions
   */
  const generateMessageSuggestions = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.generateMessageSuggestions(params);
      return response.suggestions || [];
    } catch (err) {
      console.error('Error generating message suggestions:', err);
      setError('Failed to generate message suggestions');
      toast.error('Failed to generate message suggestions');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Convert natural language to segment rules
   * @param {string} prompt - Natural language prompt
   * @returns {Promise<Object>} Generated segment rules
   */
  const convertNLToRules = useCallback(async (prompt) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.naturalLanguageToRules(prompt);
      return response.rules || null;
    } catch (err) {
      console.error('Error converting natural language to rules:', err);
      setError('Failed to convert text to segment rules');
      toast.error('Failed to convert text to segment rules');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Generate campaign insights
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<Object>} Campaign insights
   */
  const generateCampaignInsights = useCallback(async (campaignId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.generateCampaignInsights(campaignId);
      return response;
    } catch (err) {
      console.error('Error generating campaign insights:', err);
      setError('Failed to generate campaign insights');
      toast.error('Failed to generate campaign insights');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Generate optimal send time recommendations
   * @param {string} segmentId - Segment ID
   * @returns {Promise<Object>} Send time recommendations
   */
  const getOptimalSendTime = useCallback(async (segmentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.getOptimalSendTime(segmentId);
      return response;
    } catch (err) {
      console.error('Error getting optimal send time:', err);
      setError('Failed to get optimal send time recommendations');
      toast.error('Failed to get optimal send time recommendations');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Generate lookalike audience
   * @param {string} segmentId - Source segment ID
   * @returns {Promise<Object>} Lookalike audience rules
   */
  const generateLookalikeAudience = useCallback(async (segmentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.generateLookalikeAudience(segmentId);
      return response;
    } catch (err) {
      console.error('Error generating lookalike audience:', err);
      setError('Failed to generate lookalike audience');
      toast.error('Failed to generate lookalike audience');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Automatically tag a campaign
   * @param {Object} params - Parameters for auto-tagging
   * @returns {Promise<Array>} Suggested tags
   */
  const autoTagCampaign = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.autoTagCampaign(params);
      return response.tags || [];
    } catch (err) {
      console.error('Error auto-tagging campaign:', err);
      setError('Failed to generate campaign tags');
      toast.error('Failed to generate campaign tags');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Suggest relevant images
   * @param {Object} params - Parameters for image suggestions
   * @returns {Promise<Array>} Image suggestions
   */
  const suggestImages = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.suggestImages(params);
      return response.images || [];
    } catch (err) {
      console.error('Error suggesting images:', err);
      setError('Failed to suggest relevant images');
      toast.error('Failed to suggest relevant images');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    loading,
    error,
    generateMessageSuggestions,
    convertNLToRules,
    generateCampaignInsights,
    getOptimalSendTime,
    generateLookalikeAudience,
    autoTagCampaign,
    suggestImages
  };
};

export default useAI;