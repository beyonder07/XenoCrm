import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
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
          deliveryRate: Number(deliveryRate).toFixed(2),
          totalSegments: 8
        });
        
        // Performance data for chart
        setPerformanceData([
          { date: 'Jan', opens: 1420, clicks: 800 },
          { date: 'Feb', opens: 1650, clicks: 920 },
          { date: 'Mar', opens: 1800, clicks: 1000 },
          { date: 'Apr', opens: 2100, clicks: 1200 },
          { date: 'May', opens: 2400, clicks: 1400 },
          { date: 'Jun', opens: 2700, clicks: 1600 },
        ]);
        
        // Customer growth data
        setCustomerGrowth([
          { date: 'Jan', newCustomers: 850 },
          { date: 'Feb', newCustomers: 940 },
          { date: 'Mar', newCustomers: 1020 },
          { date: 'Apr', newCustomers: 1080 },
          { date: 'May', newCustomers: 1180 },
          { date: 'Jun', newCustomers: 1250 },
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
      className="p-4 sm:p-6"
    >
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Here's what's happening with your campaigns today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {/* Total Customers */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Total Customers</h2>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 sm:p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Active Campaigns</h2>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
            </div>
          </div>
        </div>

        {/* Delivery Rate */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Delivery Rate</h2>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.deliveryRate}%</p>
            </div>
          </div>
        </div>

        {/* Total Segments */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Total Segments</h2>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalSegments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Performance</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="opens" stroke="#8884d8" />
                <Line type="monotone" dataKey="clicks" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth Chart */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Growth</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="newCustomers" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Campaigns</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.status}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.sent}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.opens}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;