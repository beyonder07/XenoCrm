import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import  campaignService  from '../../services/campaign.service';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatNumber } from '../../utils/formatters';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const data = await campaignService.getAllCampaigns();
        console.log('Fetched campaigns:', data.data); // Log the fetched data
        setCampaigns(Array.isArray(data.data.campaigns) ? data.data.campaigns : []); // Ensure campaigns is always an array
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCreateCampaign = () => {
    navigate('/campaigns/create');
  };

  const handleViewCampaign = (id) => {
    navigate(`/campaigns/${id}`);
  };

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      // Search term filter
      if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filter === 'active' && campaign.status !== 'Active') {
        return false;
      }
      if (filter === 'completed' && campaign.status !== 'Completed') {
        return false;
      }
      if (filter === 'draft' && campaign.status !== 'Draft') {
        return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getCampaignStatusClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Campaigns</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={handleCreateCampaign}
        >
          Create Campaign
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <select
              className="w-full p-2 border rounded bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Campaigns</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No campaigns found</p>
            {searchTerm || filter !== 'all' ? (
              <button
                className="mt-4 text-blue-500 hover:text-blue-700"
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
              >
                Clear filters
              </button>
            ) : (
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleCreateCampaign}
              >
                Create your first campaign
              </button>
            )}
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <motion.div
              key={campaign._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => handleViewCampaign(campaign._id)}
              variants={itemVariants}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">{campaign.name}</h2>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getCampaignStatusClass(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Audience Size</p>
                    <p className="font-medium">{formatNumber(campaign.audienceSize || 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(campaign.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Delivered</p>
                    <p className="font-medium">
                      {formatNumber(campaign.stats?.delivered || 0)} ({campaign.stats?.deliveredPercentage || '0'}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Failed</p>
                    <p className="font-medium">
                      {formatNumber(campaign.stats?.failed || 0)} ({campaign.stats?.failedPercentage || '0'}%)
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t px-6 py-3 bg-gray-50 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {campaign.segmentName || "Custom Segment"}
                  </div>
                  <div className="text-xs font-medium text-blue-600">View Details →</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default CampaignList;