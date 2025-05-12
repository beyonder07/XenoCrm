import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import  customerService  from '../../services/customer.service';
import  campaignService  from '../../services/campaign.service';
import LoadingSpinner from '../common/LoadingSpinner';
import Card from '../common/Card';
import { formatDate, formatCurrency, timeAgo } from '../../utils/formatters';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        const customerData = await customerService.getCustomerById(id);
        setCustomer(customerData);

        // Fetch orders
        const ordersData = await customerService.getCustomerOrders(id);
        setOrders(ordersData);

        // Fetch campaigns sent to this customer
        const campaignsData = await campaignService.getCampaignsByCustomerId(id);
        setCampaigns(campaignsData);
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError('Failed to load customer details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const handleCreateCampaign = () => {
    navigate('/campaigns/create', { state: { preSelectedCustomerId: id } });
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

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <p>Customer not found</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/customers')}
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-6">
        <button
          className="flex items-center text-blue-500 hover:text-blue-700"
          onClick={() => navigate('/customers')}
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
          Back to Customers
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={handleCreateCampaign}
        >
          Create Campaign for This Customer
        </button>
      </div>

      {/* Customer Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">
            {customer.avatar ? (
              <img
                className="h-24 w-24 rounded-full"
                src={customer.avatar}
                alt={customer.name}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-semibold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
            <div className="mt-1 text-gray-500">{customer.email}</div>
            <div className="mt-1 text-gray-500">{customer.phone || 'No phone number'}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium
                  ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Orders: {customer.orderCount || 0}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Spend: {formatCurrency(customer.totalSpend || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          <button
            className={`pb-4 px-1 ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-4 px-1 ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
          <button
            className={`pb-4 px-1 ${
              activeTab === 'campaigns'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('campaigns')}
          >
            Campaigns ({campaigns.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Customer Details">
            <ul className="divide-y divide-gray-200">
              <li className="py-3 flex justify-between">
                <span className="text-gray-500">Created At</span>
                <span className="text-gray-900">{formatDate(customer.createdAt)}</span>
              </li>
              <li className="py-3 flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-900">{customer.location || 'N/A'}</span>
              </li>
              <li className="py-3 flex justify-between">
                <span className="text-gray-500">Last Order</span>
                <span className="text-gray-900">
                  {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
                </span>
              </li>
              <li className="py-3 flex justify-between">
                <span className="text-gray-500">Days Since Last Order</span>
                <span className="text-gray-900">
                  {customer.lastOrderDate
                    ? Math.floor(
                        (new Date() - new Date(customer.lastOrderDate)) / (1000 * 60 * 60 * 24)
                      )
                    : 'N/A'}
                </span>
              </li>
              <li className="py-3 flex justify-between">
                <span className="text-gray-500">Average Order Value</span>
                <span className="text-gray-900">
                  {customer.orderCount
                    ? formatCurrency(customer.totalSpend / customer.orderCount)
                    : 'N/A'}
                </span>
              </li>
            </ul>
          </Card>

          <Card title="Recent Activity">
            {[...orders, ...campaigns]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((item) => (
                <div key={item._id} className="mb-4 border-b border-gray-100 pb-4 last:pb-0 last:border-0">
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        item.orderNumber ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {item.orderNumber ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {item.orderNumber
                            ? `Placed order #${item.orderNumber}`
                            : `Received campaign: ${item.name}`}
                        </div>
                        <div className="text-xs text-gray-500">{timeAgo(item.createdAt)}</div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.orderNumber
                          ? `${item.items?.length || 0} items, ${formatCurrency(item.totalAmount)}`
                          : `Status: ${item.deliveryStatus || 'Pending'}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            {[...orders, ...campaigns].length === 0 && (
              <p className="text-gray-500 py-4 text-center">No recent activity</p>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center" colSpan="5">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Processing'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center" colSpan="4">
                    No campaigns found
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-xs text-gray-500">{campaign.type || 'Standard'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(campaign.sentAt || campaign.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {campaign.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          campaign.deliveryStatus === 'SENT'
                            ? 'bg-green-100 text-green-800'
                            : campaign.deliveryStatus === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {campaign.deliveryStatus || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default CustomerDetails;