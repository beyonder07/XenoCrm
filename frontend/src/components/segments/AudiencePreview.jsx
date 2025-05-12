import React from 'react';
import { motion } from 'framer-motion';

// If formatNumber is imported from utils, we'll implement it here just in case
const formatNumber = (num) => {
  return typeof num === 'number' ? num.toLocaleString() : '0';
};

const AudiencePreview = ({ audienceSize, isCustom }) => {
  let statusColor = 'text-gray-500';
  let statusText = 'No audience selected';
  let emoji = '🤔';

  if (audienceSize > 0) {
    statusColor = 'text-green-600';
    statusText = 'Ready to send';
    emoji = '✅';
  } else if (isCustom) {
    statusColor = 'text-yellow-600';
    statusText = 'Add conditions to define your audience';
    emoji = '⚠️';
  }

  return (
    <motion.div 
      className="flex items-center justify-between"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <span className="text-2xl mr-2">{emoji}</span>
        <div>
          <div className={`font-medium ${statusColor}`}>{statusText}</div>
          <div className="text-sm text-gray-500">
            {audienceSize > 0 
              ? `Your campaign will be sent to ${formatNumber(audienceSize)} ${audienceSize === 1 ? 'customer' : 'customers'}`
              : 'Select a segment or define custom rules to see audience size'}
          </div>
        </div>
      </div>
      <div className="text-3xl font-bold">{formatNumber(audienceSize)}</div>
    </motion.div>
  );
};

export default AudiencePreview;