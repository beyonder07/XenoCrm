import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../common/Card';
import { formatNumber, formatPercentage } from '../../utils/formatters';

const CampaignStats = ({ campaign }) => {
  // Extract stats from campaign data
  const stats = {
    sent: campaign.stats?.delivered || 0,
    failed: campaign.stats?.failed || 0,
    pending: (campaign.audienceSize || 0) - (campaign.stats?.delivered || 0) - (campaign.stats?.failed || 0),
  };

  // Prepare data for pie chart
  const chartData = [
    { name: 'Sent', value: stats.sent, color: '#10B981' },
    { name: 'Failed', value: stats.failed, color: '#EF4444' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
  ].filter(item => item.value > 0);

  // Calculate percentages
  const total = stats.sent + stats.failed + stats.pending;
  const sentPercentage = total ? (stats.sent / total) * 100 : 0;
  const failedPercentage = total ? (stats.failed / total) * 100 : 0;
  const pendingPercentage = total ? (stats.pending / total) * 100 : 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow rounded text-sm">
          <p className="font-medium">{data.name}: {formatNumber(data.value)}</p>
          <p className="text-gray-600">{formatPercentage(data.value / total)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <motion.div variants={itemVariants} className="md:col-span-2">
        <Card title="Delivery Overview">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{formatNumber(stats.sent)}</div>
              <div className="text-sm text-gray-500">Sent</div>
              <div className="text-xs text-gray-400">{formatPercentage(sentPercentage / 100)}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{formatNumber(stats.failed)}</div>
              <div className="text-sm text-gray-500">Failed</div>
              <div className="text-xs text-gray-400">{formatPercentage(failedPercentage / 100)}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{formatNumber(stats.pending)}</div>
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-xs text-gray-400">{formatPercentage(pendingPercentage / 100)}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium mb-2">Delivery Progress</div>
            <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-green-500 left-0 top-0"
                style={{ width: `${sentPercentage}%` }}
              ></div>
              <div
                className="absolute h-full bg-red-500 left-0 top-0"
                style={{ width: `${sentPercentage + failedPercentage}%`, left: `${sentPercentage}%` }}
              ></div>
              <div className="absolute w-full h-full flex items-center justify-center text-xs font-medium">
                {formatPercentage((stats.sent + stats.failed) / total)} Complete
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card title="Delivery Status">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 text-center text-sm mt-4">
            {chartData.map((entry, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: entry.color }}></div>
                <div className="text-gray-600">{entry.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="md:col-span-3">
        <Card title="Campaign Performance Metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Audience Size</div>
              <div className="text-2xl font-bold">{formatNumber(campaign.audienceSize || 0)}</div>
              <div className="text-xs text-gray-400 mt-1">Total recipients</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Delivery Rate</div>
              <div className="text-2xl font-bold">
                {formatPercentage(stats.sent / (campaign.audienceSize || 1))}
              </div>
              <div className="text-xs text-gray-400 mt-1">Successfully delivered</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Failure Rate</div>
              <div className="text-2xl font-bold">
                {formatPercentage(stats.failed / (campaign.audienceSize || 1))}
              </div>
              <div className="text-xs text-gray-400 mt-1">Failed to deliver</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Completion</div>
              <div className="text-2xl font-bold">
                {formatPercentage((stats.sent + stats.failed) / (campaign.audienceSize || 1))}
              </div>
              <div className="text-xs text-gray-400 mt-1">Overall progress</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CampaignStats;