import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * PerformanceChart component displays campaign performance metrics over time
 * @param {Object} props
 * @param {Array} props.data Array of data points for the chart
 * @param {Boolean} props.loading Loading state
 */
const PerformanceChart = ({ data = [], loading = false }) => {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'quarter'

  // Default dummy data for the chart
  const defaultData = [
    { date: '2025-05-05', delivered: 85, responses: 24, conversions: 12 },
    { date: '2025-05-06', delivered: 92, responses: 28, conversions: 15 },
    { date: '2025-05-07', delivered: 78, responses: 19, conversions: 8 },
    { date: '2025-05-08', delivered: 95, responses: 31, conversions: 18 },
    { date: '2025-05-09', delivered: 88, responses: 25, conversions: 14 },
    { date: '2025-05-10', delivered: 90, responses: 27, conversions: 16 },
    { date: '2025-05-11', delivered: 94, responses: 30, conversions: 17 }
  ];

  // Process chart data based on selected time range
  useEffect(() => {
    const processData = () => {
      // Use provided data or default dummy data
      const sourceData = data.length > 0 ? data : defaultData;
      
      // Format dates for display
      return sourceData.map(item => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
    };
    
    setChartData(processData());
  }, [data, timeRange]);

  // Time range options
  const timeRangeOptions = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Quarter', value: 'quarter' }
  ];

  // Skeleton loader for chart
  const ChartSkeleton = () => (
    <div className="flex h-64 w-full animate-pulse flex-col items-center justify-center rounded-lg bg-gray-100">
      <svg className="h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="mt-2 text-sm text-gray-500">Loading chart data...</p>
    </div>
  );

  return (
    <motion.div 
      className="rounded-lg bg-white p-6 shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Campaign Performance</h3>
        
        <div className="mt-2 flex rounded-md shadow-sm sm:mt-0">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTimeRange(option.value)}
              className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-10 focus:outline-none
                ${option.value === timeRange
                  ? 'z-10 border-indigo-500 bg-indigo-50 text-indigo-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }
                ${option.value === 'week' ? 'rounded-l-md' : ''}
                ${option.value === 'quarter' ? 'rounded-r-md' : ''}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64">
        {loading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontWeight: 500, marginBottom: '0.25rem' }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingTop: '0.5rem' }}
              />
              <Line
                name="Delivered"
                type="monotone"
                dataKey="delivered"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#4338ca', strokeWidth: 2 }}
              />
              <Line
                name="Responses"
                type="monotone"
                dataKey="responses"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
              />
              <Line
                name="Conversions"
                type="monotone"
                dataKey="conversions"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#d97706', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default PerformanceChart;