import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import CampaignList from '../components/campaigns/CampaignList';
import CampaignStats from '../components/campaigns/CampaignStats';
import CampaignInsights from '../components/ai/CampaignInsights';
import campaignService from '../services/campaign.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import { formatDate, formatNumber } from '../utils/formatters';

// Main CampaignHistory Page Container
const CampaignHistory = () => {
  return (
    <Routes>
      <Route index element={<CampaignListPage />} />
      <Route path=":id" element={<CampaignDetailsPage />} />
    </Routes>
  );
};

// Campaign List Page
const CampaignListPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would call an actual API
        // For now, we'll simulate a delay and return mock data
        const data = await mockFetchCampaigns();
        setCampaigns(data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Mock function to simulate API call
  const mockFetchCampaigns = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            _id: '1',
            name: 'Summer Sale Announcement',
            status: 'Completed',
            description: 'Notification about our summer sale with exclusive discounts for loyal customers.',
            createdAt: '2023-06-10T09:30:00Z',
            sentAt: '2023-06-10T10:00:00Z',
            audienceSize: 1500,
            segmentName: 'Frequent Shoppers',
            stats: {
              delivered: 1425,
              failed: 75,
              deliveredPercentage: 95,
              failedPercentage: 5
            }
          },
          {
            _id: '2',
            name: 'New Collection Launch',
            status: 'Active',
            description: 'Introducing our new autumn collection with early access for preferred customers.',
            createdAt: '2023-06-15T14:45:00Z',
            sentAt: '2023-06-15T15:00:00Z',
            audienceSize: 2200,
            segmentName: 'Fashion Enthusiasts',
            stats: {
              delivered: 1980,
              failed: 110,
              deliveredPercentage: 90,
              failedPercentage: 5
            }
          },
          {
            _id: '3',
            name: 'Reengagement Campaign',
            status: 'Draft',
            description: 'Win-back campaign for customers who havent made a purchase in the last 3 months.',
            createdAt: '2023-06-18T11:20:00Z',
            audienceSize: 850,
            segmentName: 'Inactive Users',
            stats: {
              delivered: 0,
              failed: 0,
              deliveredPercentage: 0,
              failedPercentage: 0
            }
          }
        ]);
      }, 1000);
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

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

  return <CampaignList campaigns={campaigns} />;
};

// Campaign Details Page
const CampaignDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch campaign details using the real API
        const campaignData = await campaignService.getCampaignById(id);
        console.log('Fetched campaign details:', campaignData);
        
        // Extract campaign data from response
        let campaignDetails = null;
        if (campaignData?.data?.campaign) {
          campaignDetails = campaignData.data.campaign;
        } else if (campaignData?.data) {
          campaignDetails = campaignData.data;
        } else {
          campaignDetails = campaignData;
        }
        
        if (!campaignDetails) {
          throw new Error('Campaign not found');
        }
        
        setCampaign(campaignDetails);
        
        // Fetch campaign logs
        const logsData = await campaignService.getCampaignLogs(id);
        console.log('Fetched campaign logs:', logsData);
        
        // Extract logs from response
        let campaignLogs = [];
        if (logsData?.data?.logs) {
          campaignLogs = logsData.data.logs;
        } else if (logsData?.logs) {
          campaignLogs = logsData.logs;
        } else if (Array.isArray(logsData)) {
          campaignLogs = logsData;
        }
        
        setLogs(campaignLogs);
      } catch (err) {
        console.error('Error fetching campaign details:', err);
        setError(err.message || 'Failed to load campaign details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/campaigns/history')}
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Campaign not found</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/campaigns/history')}
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="flex justify-between items-start mb-6">
        <button
          className="flex items-center text-blue-500 hover:text-blue-700"
          onClick={() => navigate('/campaigns/history')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Campaigns
        </button>
      </div>

      <div className="mb-6">
        <Card>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{campaign.name}</h1>
                <p className="text-gray-600 mt-1">{campaign.description}</p>
              </div>
              <div className="mt-4 md:mt-0">
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium">{formatDate(campaign.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sent</div>
                <div className="font-medium">
                  {campaign.sentAt ? formatDate(campaign.sentAt) : 'Not sent yet'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Audience Size</div>
                <div className="font-medium">{formatNumber(campaign.audienceSize)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Segment</div>
                <div className="font-medium">{campaign.segmentName}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Message Template</div>
              <div className="p-3 bg-white border border-gray-200 rounded text-gray-800">
                {campaign.message}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <CampaignStats campaign={campaign} />
      </div>

      <div className="mb-6">
        <CampaignInsights campaignId={id} campaignData={campaign} />
      </div>

      <div className="mb-6">
        <Card title="Delivery Logs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center" colSpan={5}>
                      No delivery logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.customerEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.status === 'SENT'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.sentAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.failureReason || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default CampaignHistory;