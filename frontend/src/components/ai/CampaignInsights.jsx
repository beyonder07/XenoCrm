import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import aiService from '../../services/ai.service';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const CampaignInsights = ({ campaignId, campaignData }) => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!campaignId && !campaignData) {
        setError('No campaign data provided');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        let insightsData;
        
        if (campaignId) {
          insightsData = await aiService.generateCampaignInsights(campaignId);
        } else if (campaignData) {
          // Generate insights based on actual campaign data
          const delivered = campaignData.stats?.delivered || 0;
          const failed = campaignData.stats?.failed || 0;
          const total = campaignData.audienceSize || (delivered + failed);
          const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
          
          insightsData = {
            summary: `Campaign performance analysis for "${campaignData.name}":`,
            keyFindings: [
              `Delivery Rate: ${deliveryRate.toFixed(1)}% (${delivered} out of ${total} messages delivered)`,
              failed > 0 ? `Failed Deliveries: ${failed} messages (${((failed/total) * 100).toFixed(1)}%)` : 'All messages delivered successfully',
              `Campaign Status: ${campaignData.status || 'Unknown'}`
            ],
            recommendations: [
              deliveryRate < 90 ? 'Consider reviewing your contact list for invalid entries' : 'Maintain your current contact management practices',
              failed > 0 ? 'Investigate failed deliveries to improve future campaign performance' : 'Your delivery success rate is excellent',
              'Monitor campaign engagement metrics for deeper insights'
            ]
          };
        }
        
        if (!insightsData) {
          throw new Error('Failed to generate insights');
        }
        
        setInsights(insightsData);
      } catch (err) {
        console.error('Error fetching campaign insights:', err);
        setError('Failed to load campaign insights. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, [campaignId, campaignData]);

  if (isLoading) {
    return (
      <Card title="Campaign Insights">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Generating insights...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Campaign Insights">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </Card>
    );
  }

  if (!insights || !insights.keyFindings || !insights.recommendations) {
    return (
      <Card title="Campaign Insights">
        <p className="text-gray-500 text-center py-4">No insights available for this campaign.</p>
      </Card>
    );
  }

  return (
    <Card title="AI-Generated Campaign Insights">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Summary</h3>
          </div>
          <p className="text-gray-700 pl-11">{insights.summary}</p>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Key Findings</h3>
          </div>
          <ul className="pl-11 space-y-2">
            {insights.keyFindings.map((finding, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-gray-700"
              >
                • {finding}
              </motion.li>
            ))}
          </ul>
        </div>
        
        <div>
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Recommendations</h3>
          </div>
          <ul className="pl-11 space-y-2">
            {insights.recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                className="text-gray-700"
              >
                • {recommendation}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </Card>
  );
};

export default CampaignInsights;