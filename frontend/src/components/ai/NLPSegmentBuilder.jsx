import React, { useState } from 'react';
import { motion } from 'framer-motion';
import aiService  from '../../services/ai.service';
import LoadingSpinner from '../common/LoadingSpinner';

const NLPSegmentBuilder = ({ onRulesGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const examples = [
    "Customers who spent over ₹10,000 in the last 3 months",
    "Inactive users who haven't made a purchase in 90 days",
    "First-time customers who bought from electronics category",
    "Customers from Bangalore who ordered at least twice"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a description of your audience');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await aiService.naturalLanguageToRules(prompt.trim());
      
      // Pass the generated rules back to the parent component
      if (response && response.rules) {
        onRulesGenerated(response.rules);
        setIsSuccess(true);
        
        // Reset success message after a delay
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      } else {
        setError('Failed to generate rules. Please try a different description.');
      }
    } catch (err) {
      console.error('Error converting natural language to rules:', err);
      setError('An error occurred. Please try again with a simpler description.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Natural Language Segment Builder</h3>
      <p className="text-sm text-gray-600 mb-4">
        Describe your target audience in plain English, and our AI will convert it into segment rules.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="nlPrompt" className="block text-sm font-medium text-gray-700 mb-1">
            Audience Description
          </label>
          <textarea
            id="nlPrompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Customers who spent over ₹10,000 in the last 3 months"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}
        
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-sm text-green-600"
          >
            Rules successfully generated!
          </motion.div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`flex items-center px-4 py-2 rounded-md text-white transition-colors ${
              isLoading || !prompt.trim()
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> 
                Generating...
              </>
            ) : (
              'Generate Rules'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NLPSegmentBuilder;