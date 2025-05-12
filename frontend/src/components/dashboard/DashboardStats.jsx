import { motion } from 'framer-motion';
import { useMemo } from 'react';

/**
 * DashboardStats component displays key metrics in a responsive grid
 * @param {Object} props
 * @param {Array} props.stats Array of stat objects
 * @param {Boolean} props.loading Loading state
 */
const DashboardStats = ({ stats = [], loading = false }) => {
  // Default stats if none provided
  const defaultStats = useMemo(() => [
    {
      id: 'total-customers',
      label: 'Total Customers',
      value: '0',
      change: '0%',
      trend: 'neutral',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'active-campaigns',
      label: 'Active Campaigns',
      value: '0',
      change: '0%',
      trend: 'neutral',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      id: 'delivery-rate',
      label: 'Delivery Rate',
      value: '0%',
      change: '0%',
      trend: 'neutral',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'response-rate',
      label: 'Response Rate',
      value: '0%',
      change: '0%',
      trend: 'neutral',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
  ], []);

  // Use provided stats or defaults
  const displayStats = stats.length > 0 ? stats : defaultStats;

  // Get trend color based on trend direction
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  // Get trend icon based on trend direction
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        );
      case 'down':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {displayStats.map((stat, index) => (
        <motion.div
          key={stat.id}
          className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          custom={index}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                {stat.icon}
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="truncate text-sm font-medium text-gray-500">{stat.label}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {loading ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                
                {!loading && stat.change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${getTrendColor(stat.trend)}`}>
                    <span className="mr-1">{getTrendIcon(stat.trend)}</span>
                    <span>{stat.change}</span>
                  </div>
                )}
              </dd>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;