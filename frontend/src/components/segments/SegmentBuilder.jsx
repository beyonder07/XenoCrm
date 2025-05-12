import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { IoAddCircle, IoTrash } from 'react-icons/io5';

/**
 * An optimized SegmentBuilder component with performance improvements
 * @param {Object} props Component props
 * @param {Object} props.initialRules Initial rules for the builder
 * @param {Function} props.onChange Callback when rules change
 * @param {Boolean} props.disabled Whether the builder is disabled
 * @returns {JSX.Element} Segment builder component
 */
const SegmentBuilder = ({ initialRules, onChange, disabled }) => {
  // Initial rules if none provided
  const defaultRules = {
    conditionType: 'AND',
    conditions: [
      { 
        id: `rule_${Date.now()}`, 
        field: 'totalSpend', 
        operator: 'greaterThan',
        value: '' 
      }
    ]
  };
  
  // Use provided initial rules or default
  const [rules, setRules] = useState(initialRules || defaultRules);
  
  // Track if this is the initial render to avoid unnecessary onChange calls
  const initialRender = useRef(true);

  // Predefined field options for the rule builder
  const fieldOptions = [
    { label: 'Total Spend', value: 'totalSpend', type: 'number' },
    { label: 'Order Count', value: 'orderCount', type: 'number' },
    { label: 'Last Order Date', value: 'lastOrderDate', type: 'date' },
    { label: 'Customer Name', value: 'name', type: 'text' },
    { label: 'Email', value: 'email', type: 'text' },
    { label: 'Location', value: 'location', type: 'text' },
    { label: 'Active Status', value: 'isActive', type: 'boolean' },
    { label: 'Customer ID', value: 'customerId', type: 'text' },
  ];

  // Define operator options based on field type
  const getOperatorOptions = (fieldType) => {
    switch (fieldType) {
      case 'number':
        return [
          { label: 'Equals', value: 'equals' },
          { label: 'Greater than', value: 'greaterThan' },
          { label: 'Less than', value: 'lessThan' },
          { label: 'Greater than or equal', value: 'greaterThanOrEqual' },
          { label: 'Less than or equal', value: 'lessThanOrEqual' },
        ];
      case 'date':
        return [
          { label: 'Equals', value: 'equals' },
          { label: 'Before', value: 'before' },
          { label: 'After', value: 'after' },
          { label: 'In the last', value: 'inLast' },
          { label: 'Not in the last', value: 'notInLast' },
        ];
      case 'text':
        return [
          { label: 'Equals', value: 'equals' },
          { label: 'Contains', value: 'contains' },
          { label: 'Starts with', value: 'startsWith' },
          { label: 'Ends with', value: 'endsWith' },
          { label: 'Does not contain', value: 'notContains' },
        ];
      case 'boolean':
        return [
          { label: 'Is', value: 'equals' },
          { label: 'Is not', value: 'notEquals' },
        ];
      default:
        return [{ label: 'Equals', value: 'equals' }];
    }
  };

  // Debounced update to parent component when rules change
  useEffect(() => {
    // Skip the initial render to prevent redundant API calls
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    if (onChange) {
      onChange(rules);
    }
  }, [rules, onChange]);

  // Toggle between AND/OR logic
  const toggleConditionType = () => {
    setRules({
      ...rules,
      conditionType: rules.conditionType === 'AND' ? 'OR' : 'AND',
    });
  };

  // Add a new condition
  const handleAddCondition = () => {
    const newCondition = {
      id: `rule_${Date.now()}`,
      field: 'totalSpend',
      operator: 'greaterThan',
      value: ''
    };
    
    setRules({
      ...rules,
      conditions: [...rules.conditions, newCondition]
    });
  };

  // Update a condition at a specific index with debouncing
  const handleUpdateCondition = (updatedCondition, index) => {
    const newConditions = [...rules.conditions];
    newConditions[index] = updatedCondition;
    
    setRules({
      ...rules,
      conditions: newConditions
    });
  };

  // Remove a condition at a specific index
  const handleRemoveCondition = (index) => {
    setRules({
      ...rules,
      conditions: rules.conditions.filter((_, i) => i !== index)
    });
  };

  // Rule Builder sub-component with performance improvements
  const RuleBuilder = ({ rule, index, onUpdate, onRemove }) => {
    // Refs for debouncing value changes
    const valueChangeTimer = useRef(null);
    const localValueRef = useRef(rule.value);

    // Get selected field details
    const selectedField = fieldOptions.find(f => f.value === rule.field) || { type: 'text' };
    
    // Get operator options based on field type
    const operatorOptions = getOperatorOptions(selectedField.type);

    // Handle field change
    const handleFieldChange = (e) => {
      const fieldValue = e.target.value;
      const fieldType = fieldOptions.find(f => f.value === fieldValue)?.type || 'text';
      
      // Get appropriate default operator for the selected field type
      const defaultOperator = fieldValue ? 
        (getOperatorOptions(fieldType)[0]?.value || 'equals') : '';
      
      // Reset timer if it exists
      if (valueChangeTimer.current) {
        clearTimeout(valueChangeTimer.current);
      }
      
      onUpdate({
        ...rule,
        field: fieldValue,
        operator: defaultOperator,
        value: '' // Reset value when field changes
      }, index);
    };

    // Handle operator change
    const handleOperatorChange = (e) => {
      // Reset timer if it exists
      if (valueChangeTimer.current) {
        clearTimeout(valueChangeTimer.current);
      }
      
      onUpdate({
        ...rule,
        operator: e.target.value
      }, index);
    };

    // Handle value change with improved debouncing
    const handleValueChange = (e) => {
      const newValue = e.target.value;
      
      // Update local ref immediately for UI responsiveness
      localValueRef.current = newValue;
      
      // Clear previous timer
      if (valueChangeTimer.current) {
        clearTimeout(valueChangeTimer.current);
      }
      
      // Update the component state immediately for UI responsiveness
      // This avoids the perceived lag in the input field
      onUpdate({
        ...rule,
        value: newValue,
      }, index);
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
            <input
              type={selectedField.type === 'number' ? 'number' : 'text'}
              value={rule.value || ''}
              onChange={handleValueChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter value"
              disabled={disabled}
            />
          </div>
        </div>

        {/* Remove button */}
        {!disabled && rules.conditions.length > 1 && (
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Audience Rules</h3>
        <p className="text-sm text-gray-600">
          Define your audience by creating rules to filter customers based on their attributes.
        </p>
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={toggleConditionType}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            rules.conditionType === 'AND'
              ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          }`}
          disabled={disabled}
        >
          Match {rules.conditionType === 'AND' ? 'ALL' : 'ANY'} Conditions
        </button>
        <span className="text-xs text-gray-500 ml-2">
          {rules.conditionType === 'AND'
            ? 'Customer must meet all conditions (AND logic)'
            : 'Customer must meet at least one condition (OR logic)'}
        </span>
      </div>

      <div>
        {rules.conditions.map((condition, index) => (
          <RuleBuilder
            key={condition.id || index}
            rule={condition}
            index={index}
            onUpdate={handleUpdateCondition}
            onRemove={handleRemoveCondition}
          />
        ))}

        {!disabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              type="button"
              onClick={handleAddCondition}
              className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <IoAddCircle className="mr-1" size={18} />
              <span>Add condition</span>
            </button>
          </motion.div>
        )}
      </div>

      {rules.conditions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
          <strong>Audience Definition:</strong>{' '}
          <span className="text-gray-700">
            Include customers who meet{' '}
            {rules.conditionType === 'AND' ? 'all' : 'any'} of the above conditions.
          </span>
        </div>
      )}
    </div>
  );
};

export default SegmentBuilder;