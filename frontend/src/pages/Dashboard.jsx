import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentCampaigns from '../components/dashboard/RecentCampaigns';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import Card from '../components/common/Card';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { formatDate, formatNumber } from '../utils/formatters';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCampaigns: 0,
    deliveryRate: 0,
    totalSegments: 0
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [customerGrowth, setCustomerGrowth] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would make API calls to get this data
        // For now, we'll simulate with mock data
        
        // Get recent campaigns
        const campaignsData = await mockFetchCampaigns();
        setRecentCampaigns(campaignsData);
        
        // Get customer stats
        const customerStats = await mockFetchCustomerStats();
        
        // Calculate dashboard stats
        const activeCampaigns = campaignsData.filter(c => c.status === 'Active').length;
        const completedCampaigns = campaignsData.filter(c => c.status === 'Completed').length;
        const totalDelivered = campaignsData.reduce((sum, c) => sum + (c.stats?.delivered || 0), 0);
        const totalAudience = campaignsData.reduce((sum, c) => sum + (c.audienceSize || 0), 0);
        const deliveryRate = totalAudience > 0 ? (totalDelivered / totalAudience) * 100 : 0;
        
        setStats({
          totalCustomers: customerStats.totalCustomers,
          activeCampaigns,
          deliveryRate,
          totalSegments: 8
        });
        
        // Performance data for chart
        setPerformanceData([
          { name: 'Jan', delivered: 1420, failed: 80 },
          { name: 'Feb', delivered: 1650, failed: 120 },
          { name: 'Mar', delivered: 1800, failed: 90 },
          { name: 'Apr', delivered: 2100, failed: 100 },
          { name: 'May', delivered: 2400, failed: 150 },
          { name: 'Jun', delivered: 2700, failed: 180 },
        ]);
        
        // Customer growth data
        setCustomerGrowth([
          { month: 'Jan', count: 850 },
          { month: 'Feb', count: 940 },
          { month: 'Mar', count: 1020 },
          { month: 'Apr', count: 1080 },
          { month: 'May', count: 1180 },
          { month: 'Jun', count: 1250 },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock function to simulate API call to get campaigns
  const mockFetchCampaigns = () => {
    return Promise.resolve([
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
  };

  // Mock function to simulate API call to get customer stats
  const mockFetchCustomerStats = () => {
    return Promise.resolve({
      totalCustomers: 1250,
      activeCustomers: 980,
      inactiveCustomers: 270,
      newCustomers: 125,
      recentlyActiveCustomers: 430,
      totalSpend: 8750000,
      avgSpend: 7000
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your campaigns today
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Total Customers</h2>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalCustomers)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Active Campaigns</h2>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Delivery Rate</h2>
              <p className="text-2xl font-bold text-gray-900">{stats.deliveryRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Total Segments</h2>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSegments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2">
          <Card title="Recent Campaigns">
            {recentCampaigns.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No campaigns found</p>
                <button
                  onClick={() => navigate('/campaigns/create')}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Create your first campaign
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCampaigns.map(campaign => (
                  <div key={campaign._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{campaign.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Segment: {campaign.segmentName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Sent: {formatDate(campaign.sentAt || campaign.createdAt)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Delivery: {campaign.stats?.deliveredPercentage || 0}%</span>
                        <span>{campaign.stats?.delivered || 0} / {campaign.audienceSize || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${campaign.stats?.deliveredPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-right">
              <button
                onClick={() => navigate('/campaigns/history')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all campaigns →
              </button>
            </div>
          </Card>
          
          {/* Performance Chart */}
          <div className="mt-6">
            <Card title="Campaign Delivery Performance">
              <div className="h-80">
                <PerformanceChart data={performanceData} />
              </div>
            </Card>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="space-y-4">
              <button
                onClick={() => navigate('/campaigns/create')}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Campaign
              </button>
              <button
                onClick={() => navigate('/segments')}
                className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Manage Segments
              </button>
              <button
                onClick={() => navigate('/customers')}
                className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                View Customers
              </button>
            </div>
          </Card>
          
          {/* Customer Growth */}
          <Card title="Customer Growth">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={customerGrowth}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          {/* Recent Activity */}
          <Card title="Recent Activity">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Campaign Completed</p>
                  <p className="text-xs text-gray-500">Summer Sale Announcement was completed with 95% delivery rate</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">New Campaign Started</p>
                  <p className="text-xs text-gray-500">New Collection Launch campaign is now active</p>
                  <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">New Customers Added</p>
                  <p className="text-xs text-gray-500">25 new customers were added to the database</p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;