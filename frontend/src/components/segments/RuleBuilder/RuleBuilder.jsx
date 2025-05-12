import React from 'react';
import { motion } from 'framer-motion';
import { IoAddCircle, IoTrash } from 'react-icons/io5';

const RuleBuilder = ({ 
  rule, 
  index, 
  onUpdate, 
  onRemove, 
  fieldOptions, 
  getOperatorOptions, 
  disabled = false 
}) => {
  // Get selected field details
  const selectedField = fieldOptions.find(f => f.value === rule.field) || { type: 'text' };
  
  // Get operator options based on field type
  const operatorOptions = getOperatorOptions(selectedField.type);

  // Handle field change
  const handleFieldChange = (e) => {
    const fieldValue = e.target.value;
    const fieldType = fieldOptions.find(f => f.value === fieldValue)?.type || 'text';
    const defaultOperator = getOperatorOptions(fieldType)[0]?.value || 'equals';
    
    onUpdate({
      ...rule,
      field: fieldValue,
      operator: defaultOperator,
      value: ''
    }, index);
  };

  // Handle operator change
  const handleOperatorChange = (e) => {
    onUpdate({
      ...rule,
      operator: e.target.value
    }, index);
  };

  // Handle value change
  const handleValueChange = (e) => {
    onUpdate({
      ...rule,
      value: e.target.value
    }, index);
  };

  // Render appropriate value input based on field type and operator
  const renderValueInput = () => {
    // Some operators like "is empty" don't need a value input
    const noValueOperators = ['isEmpty', 'isNotEmpty'];
    if (noValueOperators.includes(rule.operator)) {
      return null;
    }

    switch (selectedField.type) {
      case 'number':
        return (
          <input
            type="number"
            value={rule.value || ''}
            onChange={handleValueChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Enter value"
            disabled={disabled}
          />
        );
      case 'date':
        if (rule.operator === 'inTheLast' || rule.operator === 'notInTheLast') {
          return (
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="number"
                value={rule.value?.split(' ')[0] || ''}
                onChange={(e) => {
                  const timeUnit = rule.value?.split(' ')[1] || 'days';
                  onUpdate({
                    ...rule,
                    value: `${e.target.value} ${timeUnit}`
                  }, index);
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Value"
                disabled={disabled}
              />
              <select
                value={rule.value?.split(' ')[1] || 'days'}
                onChange={(e) => {
                  const value = rule.value?.split(' ')[0] || '';
                  onUpdate({
                    ...rule,
                    value: `${value} ${e.target.value}`
                  }, index);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                disabled={disabled}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          );
        } else {
          return (
            <input
              type="date"
              value={rule.value || ''}
              onChange={handleValueChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              disabled={disabled}
            />
          );
        }
      case 'boolean':
        return (
          <select
            value={rule.value || ''}
            onChange={handleValueChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            disabled={disabled}
          >
            <option value="">Select value</option>
            <option value="true">Yes / True</option>
            <option value="false">No / False</option>
          </select>
        );
      default:
        // Text input for everything else
        return (
          <input
            type="text"
            value={rule.value || ''}
            onChange={handleValueChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Enter value"
            disabled={disabled}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 mb-3"
    >
      <div className="flex-1 grid grid-cols-12 gap-2">
        {/* Field selector */}
        <div className="col-span-12 sm:col-span-4">
          <select
            value={rule.field || ''}
            onChange={handleFieldChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            disabled={disabled}
          >
            <option value="">Select field</option>
            {fieldOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Operator selector */}
        <div className="col-span-12 sm:col-span-3">
          <select
            value={rule.operator || ''}
            onChange={handleOperatorChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            disabled={disabled || !rule.field}
          >
            <option value="">Select operator</option>
            {operatorOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Value input */}
        <div className="col-span-12 sm:col-span-5">
          {renderValueInput()}
        </div>
      </div>

      {/* Remove button */}
      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-red-500 hover:text-red-700 transition-colors"
          title="Remove condition"
        >
          <IoTrash size={18} />
        </button>
      )}
    </motion.div>
  );
};

export default RuleBuilder;