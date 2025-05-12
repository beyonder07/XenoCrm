import React from 'react';
import { motion } from 'framer-motion';

const ValueInput = ({ field, operator, value, onChange }) => {
  // Based on field and operator, render appropriate input
  const renderInput = () => {
    // For date fields
    if (field === 'lastPurchaseDate' || field === 'createdAt') {
      return (
        <input
          type="date"
          name="value"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      );
    }
    
    // For boolean fields (isActive, etc.)
    if (operator === 'is' && ['isActive', 'hasAccount'].includes(field)) {
      return (
        <select
          name="value"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="" disabled>Select</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }
    
    // For 'between' operator with numeric fields
    if (operator === 'between' && ['totalSpend', 'orderCount', 'visits', 'inactiveDays'].includes(field)) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            name="valueMin"
            value={(value || '').split(',')[0] || ''}
            onChange={(e) => {
              const secondVal = (value || '').split(',')[1] || '';
              onChange(`${e.target.value},${secondVal}`);
            }}
            placeholder="Min"
            className="w-1/2 px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            name="valueMax"
            value={(value || '').split(',')[1] || ''}
            onChange={(e) => {
              const firstVal = (value || '').split(',')[0] || '';
              onChange(`${firstVal},${e.target.value}`);
            }}
            placeholder="Max"
            className="w-1/2 px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      );
    }
    
    // For numeric fields
    if (['totalSpend', 'orderCount', 'visits', 'inactiveDays'].includes(field)) {
      return (
        <input
          type="number"
          name="value"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      );
    }
    
    // For string fields (default)
    return (
      <input
        type="text"
        name="value"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
      />
    );
  };

  // Animation for input appearance
  const inputAnimation = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={inputAnimation}
      className="flex-grow"
    >
      {renderInput()}
    </motion.div>
  );
};

export default ValueInput;