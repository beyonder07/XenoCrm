import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import  campaignService  from '../../services/campaign.service';
import  aiService  from '../../services/ai.service';
import LoadingSpinner from '../common/LoadingSpinner';
import Card from '../common/Card';
import { formatDate, formatNumber, timeAgo } from '../../utils/formatters';

const CampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [aiInsights, setAiInsights] = useState('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const data = await campaignService.getAllCampaigns();
        console.log('Fetched Campaigns:', data);
        // Sort by created date (newest first)
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCampaigns(sortedData);
        
        // Generate AI insights if we have campaigns
        if (sortedData.length > 0) {
          generateAiInsights(sortedData);
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaign history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const generateAiInsights = async (campaignData) => {
    try {
      setIsLoadingInsights(true);
      const insights = await aiService.getCampaignPerformanceInsights(campaignData);
      setAiInsights(insights);
    } catch (err) {
      console.error('Error generating AI insights:', err);
      setAiInsights('Unable to generate campaign insights at this time.');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleViewCampaign = (id) => {
    navigate(`/campaigns/${id}`);
  };

  const filterCampaigns = () => {
    if (filterPeriod === 'all') {
      return campaigns;
    }

    const now = new Date();
    let cutoffDate = new Date();

    if (filterPeriod === 'today') {
      cutoffDate.setHours(0, 0, 0, 0);
    } else if (filterPeriod === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (filterPeriod === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    }

    return campaigns.filter(campaign => new Date(campaign.createdAt) >= cutoffDate);
  };

  const filteredCampaigns = filterCampaigns();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Campaign History</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={() => navigate('/campaigns/create')}
        >
          Create New Campaign
        </button>
      </div>

      {campaigns.length > 0 && (
        <div className="mb-6">
          <Card title="Campaign Insights">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">AI-Generated Performance Summary</h3>
            </div>
            {isLoadingInsights ? (
              <div className="text-gray-500 italic">Generating insights...</div>
            ) : (
              <div className="text-gray-700 prose max-w-none">{aiInsights}</div>
            )}
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'campaign' : 'campaigns'} found
        </div>
        <div>
          <select
            className="p-2 border border-gray-300 rounded bg-white text-sm"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No campaigns found for the selected period.</p>
          {filterPeriod !== 'all' ? (
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => setFilterPeriod('all')}
            >
              View all campaigns
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => navigate('/campaigns/create')}
            >
              Create your first campaign
            </button>
          )}
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCampaigns.map((campaign) => (
            <motion.div
              key={campaign._id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition cursor-pointer"
              onClick={() => handleViewCampaign(campaign._id)}
              variants={itemVariants}
            >
              <div className="p-6">
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{campaign.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Created {timeAgo(campaign.createdAt)} • {formatDate(campaign.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : campaign.status === 'Active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Audience</p>
                    <p className="font-medium">{formatNumber(campaign.audienceSize || 0)} recipients</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Delivered</p>
                    <p className="font-medium text-green-600">
                      {formatNumber(campaign.stats?.delivered || 0)} ({campaign.stats?.deliveredPercentage || '0'}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Failed</p>
                    <p className="font-medium text-red-600">
                      {formatNumber(campaign.stats?.failed || 0)} ({campaign.stats?.failedPercentage || '0'}%)
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-1">Delivery Progress</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${((campaign.stats?.delivered || 0) / (campaign.audienceSize || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Segment: {campaign.segmentName || 'Custom Segment'}
                </div>
                <div className="text-sm font-medium text-blue-600">View Details →</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CampaignHistory;