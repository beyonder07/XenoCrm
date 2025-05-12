import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * RecentCampaigns component displays a list of recent campaigns
 * @param {Object} props
 * @param {Array} props.campaigns Array of campaign objects
 * @param {Boolean} props.loading Loading state
 */
const RecentCampaigns = ({ campaigns = [], loading = false }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  // Generate skeleton rows for loading state
  const skeletonRows = Array.from({ length: 5 }).map((_, i) => (
    <tr key={`skeleton-${i}`} className="animate-pulse">
      <td className="whitespace-nowrap px-6 py-4 text-sm">
        <div className="h-4 w-48 rounded bg-gray-200"></div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm">
        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm">
        <div className="h-4 w-16 rounded bg-gray-200"></div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm">
        <div className="h-4 w-20 rounded bg-gray-200"></div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm">
        <div className="h-4 w-16 rounded bg-gray-200"></div>
      </td>
    </tr>
  ));

  // Get status badge based on campaign status
  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Table animations
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="overflow-hidden rounded-lg bg-white shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Campaigns</h3>
          <Link 
            to="/campaigns/history" 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <motion.table 
          className="min-w-full divide-y divide-gray-200"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Audience
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Sent/Delivered
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              skeletonRows
            ) : campaigns.length > 0 ? (
              campaigns.map((campaign, index) => (
                <motion.tr 
                  key={campaign.id}
                  variants={rowVariants}
                  onMouseEnter={() => setHoveredRow(campaign.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={hoveredRow === campaign.id ? 'bg-gray-50' : ''}
                  whileHover={{ scale: 1.005 }}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {campaign.audience}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {campaign.delivered}/{campaign.sent}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(campaign.date)}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No campaigns found. <Link to="/campaigns/create" className="font-medium text-indigo-600 hover:text-indigo-500">Create your first campaign</Link>
                </td>
              </tr>
            )}
          </tbody>
        </motion.table>
      </div>
    </motion.div>
  );
};

export default RecentCampaigns;