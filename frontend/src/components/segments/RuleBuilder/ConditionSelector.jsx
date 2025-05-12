import React from 'react';
import { motion } from 'framer-motion';

const ConditionSelector = ({ field, operator, onFieldChange, onOperatorChange }) => {
  // Define fields available for segmentation
  const fields = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'totalSpend', label: 'Total Spend' },
    { value: 'orderCount', label: 'Order Count' },
    { value: 'lastPurchaseDate', label: 'Last Purchase Date' },
    { value: 'createdAt', label: 'Registration Date' },
    { value: 'isActive', label: 'Is Active' },
    { value: 'hasAccount', label: 'Has Account' },
    { value: 'visits', label: 'Visit Count' },
    { value: 'inactiveDays', label: 'Inactive For (Days)' },
  ];

  // Define operators based on selected field
  const getOperatorsForField = (selectedField) => {
    // String operators
    if (['firstName', 'lastName', 'email'].includes(selectedField)) {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' }
      ];
    }
    
    // Date operators
    if (['lastPurchaseDate', 'createdAt'].includes(selectedField)) {
      return [
        { value: 'before', label: 'Before' },
        { value: 'after', label: 'After' },
        { value: 'on', label: 'On' }
      ];
    }
    
    // Boolean operators
    if (['isActive', 'hasAccount'].includes(selectedField)) {
      return [
        { value: 'is', label: 'Is' }
      ];
    }
    
    // Number operators (default)
    return [
      { value: 'equals', label: 'Equals' },
      { value: 'lessThan', label: 'Less than' },
      { value: 'greaterThan', label: 'Greater than' },
      { value: 'between', label: 'Between' }
    ];
  };

  const operators = getOperatorsForField(field);

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-2 w-full">
      <div className="w-full md:w-1/2">
        <select
          name="field"
          value={field}
          onChange={(e) => onFieldChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="" disabled>Select Field</option>
          {fields.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full md:w-1/2">
        <select
          name="operator"
          value={operator}
          onChange={(e) => onOperatorChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="" disabled>Select Operator</option>
          {operators.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ConditionSelector;