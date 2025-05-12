import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import aiService from '../../services/ai.service';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';

const AIMessageSuggestions = ({ segmentRules, segmentId, onSelect, onCancel, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    generateSuggestions();
  }, [segmentRules, segmentId]);

  const generateSuggestions = async (prompt = '') => {
    try {
      setIsLoading(true);
      setError(null);
      setSuggestions([]); // Clear existing suggestions while loading

      const params = {
        segmentId: segmentId || null,
        customRules: segmentId ? null : segmentRules,
        objective: 'engagement',
        tone: 'friendly',
        customPrompt: prompt || undefined
      };

      console.log('Request Params:', params);

      const response = await aiService.generateMessageSuggestions(params);
      console.log('Response Data:', response);

      let extractedSuggestions = [];
      
      if (response?.data?.suggestions) {
        extractedSuggestions = response.data.suggestions;
      } else if (response?.suggestions) {
        extractedSuggestions = response.suggestions;
      } else if (Array.isArray(response)) {
        extractedSuggestions = response;
      } else if (response?.data && Array.isArray(response.data)) {
        extractedSuggestions = response.data;
      }
      
      // Add unique IDs to suggestions if they don't have them
      extractedSuggestions = extractedSuggestions.map((suggestion, index) => ({
        ...suggestion,
        id: suggestion.id || `suggestion-${index}`,
      }));
      
      console.log('Extracted suggestions with IDs:', extractedSuggestions);
      
      // Set suggestions and clear loading state immediately after receiving data
      if (extractedSuggestions.length > 0) {
        setSuggestions(extractedSuggestions);
        setIsLoading(false); // Clear loading state as soon as we have suggestions
      } else {
        setError('No suggestions were generated. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error generating message suggestions:', err);
      setError('Failed to generate message suggestions. Please try again.');
      setIsLoading(false); // Ensure loading state is cleared on error
      if (onError) {
        onError(err);
      }
    }
  };

  const handleCustomPromptSubmit = async (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsGenerating(true);
    await generateSuggestions(customPrompt);
    setIsGenerating(false);
  };

  const toggleSuggestion = (suggestion) => {
    console.log('Toggling suggestion:', suggestion);
    setSelectedSuggestions((prev) => {
      const isSelected = prev.some(s => s.id === suggestion.id);
      if (isSelected) {
        return prev.filter(s => s.id !== suggestion.id);
      } else {
        return [...prev, suggestion];
      }
    });
  };

  const handleApply = () => {
    console.log('Selected suggestions before apply:', selectedSuggestions);
    if (selectedSuggestions.length === 0) {
      toast.error('Please select at least one suggestion to apply.');
      return;
    }

    // If only one suggestion is selected, use it directly
    if (selectedSuggestions.length === 1) {
      console.log('Applying single suggestion:', selectedSuggestions[0].message);
      onSelect(selectedSuggestions[0].message);
      return;
    }

    // If multiple suggestions are selected, combine them
    const combinedMessage = selectedSuggestions
      .map(s => s.message)
      .join('\n\n---\n\n');
    
    console.log('Applying combined message:', combinedMessage);
    onSelect(combinedMessage);
  };

  const handleCopySuggestion = (suggestion, index) => {
    navigator.clipboard.writeText(suggestion.message)
      .then(() => {
        setCopiedIndex(index);
        toast.success('Suggestion copied to clipboard!');
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy suggestion');
      });
  };

  return (
    <Modal title="AI Message Suggestions" onClose={onCancel} size="lg">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            AI Message Suggestions
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Click the copy button next to any suggestion to copy it to your clipboard, then paste it into your message.
          </p>
          <form onSubmit={handleCustomPromptSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter custom prompt for message generation..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isGenerating || !customPrompt.trim()}
                className={`px-4 py-2 rounded-md text-white ${
                  isGenerating || !customPrompt.trim()
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Generating AI message suggestions...</p>
            <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-700">{error}</p>
            <button
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
              onClick={() => {
                setError(null);
                generateSuggestions();
              }}
            >
              Try Again
            </button>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      suggestion.tone === 'friendly'
                        ? 'bg-green-100 text-green-800'
                        : suggestion.tone === 'professional'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {suggestion.tone || 'Friendly'}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      Effectiveness: {suggestion.strength || 'High'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopySuggestion(suggestion, index)}
                    className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                      copiedIndex === index
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {copiedIndex === index ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-800 whitespace-pre-wrap">{suggestion.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No suggestions available. Try entering a custom prompt above.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AIMessageSuggestions;