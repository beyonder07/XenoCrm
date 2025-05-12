import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import segmentService from '@services/segment.service';

/**
 * Custom hook for segment builder functionality with optimized performance
 * @returns {Object} Segment builder methods and state
 */
const useSegmentBuilder = () => {
  // State for segment rules
  const [rules, setRules] = useState({
    conditionType: 'AND',
    conditions: [
      // Add a default condition to start with
      { 
        id: `rule_${Date.now()}`, 
        field: 'totalSpend', 
        operator: 'greaterThan', 
        value: '' 
      }
    ]
  });

  // State for segment metadata
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  
  // State for audience preview
  const [audiencePreview, setAudiencePreview] = useState({
    count: 0,
    loading: false,
    error: null
  });

  // Keep track of last preview request to avoid redundant calls
  const lastPreviewRequestRef = useRef(null);
  
  // Debounce timer reference
  const previewTimerRef = useRef(null);

  // Validate if rules are complete and ready for preview
  const areRulesValid = useCallback((currentRules) => {
    if (!currentRules || !currentRules.conditions || currentRules.conditions.length === 0) {
      return false;
    }
    
    // Check if any condition is incomplete
    const hasIncompleteConditions = currentRules.conditions.some(
      condition => !condition.field || !condition.operator || condition.value === ''
    );
    
    return !hasIncompleteConditions;
  }, []);

  // Generate a hash for the rules to compare with previous requests
  const getRulesHash = useCallback((currentRules) => {
    if (!currentRules) return '';
    return JSON.stringify({
      conditionType: currentRules.conditionType,
      conditions: currentRules.conditions.map(c => ({
        field: c.field,
        operator: c.operator,
        value: c.value
      }))
    });
  }, []);

  // Function to preview audience based on current rules
  const previewAudience = useCallback(async (currentRules = rules) => {
    // Don't send API call if rules are invalid
    if (!areRulesValid(currentRules)) {
      setAudiencePreview(prev => ({ ...prev, count: 0, loading: false }));
      return;
    }
    
    // Generate hash for current rules
    const rulesHash = getRulesHash(currentRules);
    
    // Skip if this exact request was just made
    if (rulesHash === lastPreviewRequestRef.current) {
      return;
    }
    
    // Update the last preview request
    lastPreviewRequestRef.current = rulesHash;
    
    try {
      setAudiencePreview(prev => ({ ...prev, loading: true, error: null }));
      
      // Call the API to get the audience preview
      const response = await segmentService.previewSegment(currentRules);
      
      // Handle different response formats safely
      let count = 0;
      if (response) {
        if (typeof response.count !== 'undefined') {
          count = response.count;
        } else if (response.data && typeof response.data.count !== 'undefined') {
          count = response.data.count;
        } else if (response.data && response.data.data && typeof response.data.data.count !== 'undefined') {
          count = response.data.data.count;
        }
      }
      
      setAudiencePreview({ count, loading: false, error: null });
    } catch (error) {
      console.error('Error previewing audience:', error);
      setAudiencePreview({ count: 0, loading: false, error: 'Failed to preview audience' });
    }
  }, [rules, areRulesValid, getRulesHash]);

  // Debounced preview function with increased delay
  const debouncedPreview = useCallback((currentRules) => {
    // Clear any existing timer
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }
    
    // Set new timer with longer delay
    previewTimerRef.current = setTimeout(() => {
      previewAudience(currentRules);
    }, 2000); // 2 seconds delay to reduce API calls
  }, [previewAudience]);

  // Update preview when rules change
  useEffect(() => {
    if (areRulesValid(rules)) {
      debouncedPreview(rules);
    } else {
      // Clear audience preview for invalid rules
      setAudiencePreview(prev => ({ ...prev, count: 0, loading: false }));
    }
    
    // Cleanup timer on unmount
    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, [rules, areRulesValid, debouncedPreview]);

  // Create a segment based on current rules
  const createSegment = async () => {
    try {
      if (!segmentName.trim()) {
        toast.error('Segment name is required');
        return null;
      }
      
      if (!areRulesValid(rules)) {
        toast.error('Complete all conditions before creating a segment');
        return null;
      }
      
      // Call the API to create the segment
      const segmentData = {
        name: segmentName,
        description: segmentDescription,
        rules
      };
      
      const response = await segmentService.createSegment(segmentData);
      
      // Clear the last request hash after successful creation
      lastPreviewRequestRef.current = null;
      
      return response;
    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error('Failed to create segment');
      return null;
    }
  };

  // Reset the builder to initial state
  const resetSegmentBuilder = () => {
    setRules({
      conditionType: 'AND',
      conditions: [
        { 
          id: `rule_${Date.now()}`, 
          field: 'totalSpend', 
          operator: 'greaterThan', 
          value: '' 
        }
      ]
    });
    setSegmentName('');
    setSegmentDescription('');
    setAudiencePreview({
      count: 0,
      loading: false,
      error: null
    });
    
    // Clear the last request hash
    lastPreviewRequestRef.current = null;
  };

  return {
    rules,
    setRules,
    segmentName,
    setSegmentName,
    segmentDescription,
    setSegmentDescription,
    audiencePreview,
    previewAudience,
    createSegment,
    resetSegmentBuilder,
    areRulesValid
  };
};

export default useSegmentBuilder;