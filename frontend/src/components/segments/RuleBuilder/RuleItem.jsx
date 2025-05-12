import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { IoTrash, IoWarningOutline } from 'react-icons/io5';

/**
 * RuleItem Component for individual rule conditions in the rule builder
 * @param {Object} props
 * @param {Object} props.rule - The rule data
 * @param {string} props.rule.id - Unique identifier for this rule
 * @param {string} props.rule.field - The field/attribute to filter on
 * @param {string} props.rule.operator - The comparison operator
 * @param {string|number} props.rule.value - The value to compare against
 * @param {Function} props.onUpdate - Callback for when the rule is updated
 * @param {Function} props.onDelete - Callback for when the rule is deleted
 * @param {Object} props.validations - Validation information for the rule
 */
const RuleItem = ({ rule, onUpdate, onDelete, validations = {} }) => {
  const [focusedField, setFocusedField] = useState(null);
  const [isEditing, setIsEditing] = useState(!rule.field);
  const valueInputRef = useRef(null);

  // Available fields with their data types and labels
  const fields = [
    { id: 'name', label: 'Customer Name', type: 'text' },
    { id: 'email', label: 'Email', type: 'text' },
    { id: 'phone', label: 'Phone Number', type: 'text' },
    { id: 'totalSpend', label: 'Total Spend', type: 'number' },
    { id: 'orderCount', label: 'Order Count', type: 'number' },
    { id: 'lastOrderDate', label: 'Last Order Date', type: 'date' },
    { id: 'createdAt', label: 'Joined Date', type: 'date' },
    { id: 'tags', label: 'Tags', type: 'array' },
    { id: 'location', label: 'Location', type: 'text' },
    { id: 'source', label: 'Acquisition Source', type: 'text' },
    { id: 'status', label: 'Status', type: 'text' },
  ];

  // Get the type of the currently selected field
  const getFieldType = () => {
    const field = fields.find(f => f.id === rule.field);
    return field ? field.type : 'text';
  };

  // Operators based on field types
  const getOperatorsForType = (type) => {
    switch (type) {
      case 'text':
        return [
          { id: 'equals', label: 'Equals' },
          { id: 'contains', label: 'Contains' },
          { id: 'startsWith', label: 'Starts with' },
          { id: 'endsWith', label: 'Ends with' },
          { id: 'isEmpty', label: 'Is empty' },
          { id: 'isNotEmpty', label: 'Is not empty' },
        ];
      case 'number':
        return [
          { id: 'equals', label: 'Equals' },
          { id: 'greaterThan', label: 'Greater than' },
          { id: 'lessThan', label: 'Less than' },
          { id: 'between', label: 'Between' },
        ];
      case 'date':
        return [
          { id: 'before', label: 'Before' },
          { id: 'after', label: 'After' },
          { id: 'between', label: 'Between' },
          { id: 'inTheLast', label: 'In the last' },
        ];
      case 'array':
        return [
          { id: 'contains', label: 'Contains' },
          { id: 'doesNotContain', label: 'Does not contain' },
          { id: 'isEmpty', label: 'Is empty' },
          { id: 'isNotEmpty', label: 'Is not empty' },
        ];
      default:
        return [
          { id: 'equals', label: 'Equals' },
          { id: 'notEquals', label: 'Does not equal' },
        ];
    }
  };

  // Get operators for the current field
  const operators = getOperatorsForType(getFieldType());

  // Check if the value is needed for this operator
  const operatorNeedsValue = () => {
    return !['isEmpty', 'isNotEmpty'].includes(rule.operator);
  };

  // Focus the value input when operator changes
  useEffect(() => {
    if (isEditing && operatorNeedsValue() && valueInputRef.current) {
      valueInputRef.current.focus();
    }
  }, [rule.operator, isEditing]);

  // When a field changes, also update the operator to a valid one for that field type
  const handleFieldChange = (fieldId) => {
    const fieldType = fields.find(f => f.id === fieldId)?.type || 'text';
    const validOperators = getOperatorsForType(fieldType);
    
    onUpdate({
      ...rule,
      field: fieldId,
      operator: validOperators[0].id,
      value: '',
    });
    
    setIsEditing(true);
  };

  // Handle operator change
  const handleOperatorChange = (operatorId) => {
    onUpdate({
      ...rule,
      operator: operatorId,
      // Reset value when changing to operators that don't need values
      value: ['isEmpty', 'isNotEmpty'].includes(operatorId) ? '' : rule.value,
    });
  };

  // Handle value change
  const handleValueChange = (value) => {
    onUpdate({
      ...rule,
      value,
    });
  };

  // Check if the field has validation errors
  const hasError = validations[rule.id]?.hasError;
  const errorMessage = validations[rule.id]?.message;

  // Custom input component based on field type
  const renderValueInput = () => {
    const fieldType = getFieldType();
    const needsValue = operatorNeedsValue();
    
    if (!needsValue) {
      return null;
    }

    switch (fieldType) {
      case 'text':
        return (
          <input
            ref={valueInputRef}
            type="text"
            value={rule.value}
            onChange={(e) => handleValueChange(e.target.value)}
            onFocus={() => setFocusedField('value')}
            onBlur={() => setFocusedField(null)}
            className={`
              px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
              border ${focusedField === 'value' 
                ? 'border-indigo-500 ring-1 ring-indigo-500' 
                : 'border-gray-300 dark:border-gray-600'}
              focus:outline-none
              ${hasError ? 'border-red-500 dark:border-red-500' : ''}
            `}
            placeholder="Enter value"
          />
        );
      case 'number':
        if (rule.operator === 'between') {
          return (
            <div className="flex items-center space-x-2">
              <input
                ref={valueInputRef}
                type="number"
                value={rule.value.split(',')[0] || ''}
                onChange={(e) => {
                  const secondVal = rule.value.split(',')[1] || '';
                  handleValueChange(`${e.target.value},${secondVal}`);
                }}
                onFocus={() => setFocusedField('value1')}
                onBlur={() => setFocusedField(null)}
                className={`
                  w-24 px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
                  border ${focusedField === 'value1' 
                    ? 'border-indigo-500 ring-1 ring-indigo-500' 
                    : 'border-gray-300 dark:border-gray-600'}
                  focus:outline-none
                  ${hasError ? 'border-red-500 dark:border-red-500' : ''}
                `}
                placeholder="Min"
              />
              <span className="text-gray-500 dark:text-gray-400">and</span>
              <input
                type="number"
                value={rule.value.split(',')[1] || ''}
                onChange={(e) => {
                  const firstVal = rule.value.split(',')[0] || '';
                  handleValueChange(`${firstVal},${e.target.value}`);
                }}
                onFocus={() => setFocusedField('value2')}
                onBlur={() => setFocusedField(null)}
                className={`
                  w-24 px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
                  border ${focusedField === 'value2' 
                    ? 'border-indigo-500 ring-1 ring-indigo-500' 
                    : 'border-gray-300 dark:border-gray-600'}
                  focus:outline-none
                  ${hasError ? 'border-red-500 dark:border-red-500' : ''}
                `}
                placeholder="Max"
              />
            </div>
          );
        } else {
          return (
            <input
              ref={valueInputRef}
              type="number"
              value={rule.value}
              onChange={(e) => handleValueChange(e.target.value)}
              onFocus={() => setFocusedField('value')}
              onBlur={() => setFocusedField(null)}
              className={`
                px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
                border ${focusedField === 'value' 
                  ? 'border-indigo-500 ring-1 ring-indigo-500' 
                  : 'border-gray-300 dark:border-gray-600'}
                focus:outline-none
                ${hasError ? 'border-red-500 dark:border-red-500' : ''}
              `}
              placeholder="Enter number"
            />
          );
        }
      case 'date':
        if (rule.operator === 'between') {
          return (
            <div className="flex items-center space-x-2">
              <input
                ref={valueInputRef}
                type="date"
                value={rule.value.split(',')[0] || ''}
                onChange={(e) => {
                  const secondVal = rule.value.split(',')[1] || '';
                  handleValueChange(`${e.target.value},${secondVal}`);
                }}
                onFocus={() => setFocusedField('value1')}
                onBlur={() => setFocusedField(null)}
                className={`
                  px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
                  border ${focusedField === 'value1' 
                    ? 'border-indigo-500 ring-1 ring-indigo-500' 
                    : 'border-gray-300 dark:border-gray-600'}
                  focus:outline-none
                  ${hasError ? 'border-red-500 dark:border-red-500' : ''}
                `}
              />
              <span className="text-gray-500 dark:text-gray-400">and</span>
              <input
                type="date"
                value={rule.value.split(',')[1] || ''}
                onChange={(e) => {
                  const firstVal = rule.value.split(',')[0] || '';
                  handleValueChange(`${firstVal},${e.target.value}`);
                }}
                onFocus={() => setFocusedField('value2')}
                onBlur={() => setFocusedField(null)}
                className={`
                  px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
                  border ${focusedField === 'value2' 
                    ? 'border-indigo-500 ring-1 ring-indigo-500' 
                    : 'border-gray-300 dark:border-gray-600'}
                  focus:outline-none
                  ${hasError ? 'border-red-500 dark:border-red-500' : ''}
                `}
              />
            </div>
          );
        } else if (rule.operator === 'inTheLast') {
          return (
            <div className="flex items-center space-x-2">
              <input
                ref={valueInputRef}
                type="number"
                value={rule.value.split(' ')[0] || ''}
                onChange={(e) => {
                  const unit = rule.value.split(' ')[1] || 'days';
                  handleValueChange(`${e.target.value} ${unit}`);
                }}
                onFocus={() => setFocusedField('value')}
                onBlur={() => setFocusedField(null)}
                className={`
                  w-20 px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
                  border ${focusedField === 'value' 
                    ? 'border-indigo-500 ring-1 ring-indigo-500' 
                    : 'border-gray-300 dark:border-gray-600'}
                  focus:outline-none
                  ${hasError ? 'border-red-500 dark:border-red-500' : ''}
                `}
                placeholder="Count"
              />
              <select
                value={rule.value.split(' ')[1] || 'days'}
                onChange={(e) => {
                  const count = rule.value.split(' ')[0] || '';
                  handleValueChange(`${count} ${e.target.value}`);
                }}
                onFocus={() => setFocusedField('valueUnit')}
                onBlur={() => setFocusedField(null)}
                className={`
                  px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
                  border ${focusedField === 'valueUnit' 
                    ? 'border-indigo-500 ring-1 ring-indigo-500' 
                    : 'border-gray-300 dark:border-gray-600'}
                  focus:outline-none
                `}
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
              ref={valueInputRef}
              type="date"
              value={rule.value}
              onChange={(e) => handleValueChange(e.target.value)}
              onFocus={() => setFocusedField('value')}
              onBlur={() => setFocusedField(null)}
              className={`
                px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
                border ${focusedField === 'value' 
                  ? 'border-indigo-500 ring-1 ring-indigo-500' 
                  : 'border-gray-300 dark:border-gray-600'}
                focus:outline-none
                ${hasError ? 'border-red-500 dark:border-red-500' : ''}
              `}
            />
          );
        }
      case 'array':
        return (
          <input
            ref={valueInputRef}
            type="text"
            value={rule.value}
            onChange={(e) => handleValueChange(e.target.value)}
            onFocus={() => setFocusedField('value')}
            onBlur={() => setFocusedField(null)}
            className={`
              px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
              border ${focusedField === 'value' 
                ? 'border-indigo-500 ring-1 ring-indigo-500' 
                : 'border-gray-300 dark:border-gray-600'}
              focus:outline-none
              ${hasError ? 'border-red-500 dark:border-red-500' : ''}
            `}
            placeholder="Enter value (comma separated)"
          />
        );
      default:
        return (
          <input
            ref={valueInputRef}
            type="text"
            value={rule.value}
            onChange={(e) => handleValueChange(e.target.value)}
            onFocus={() => setFocusedField('value')}
            onBlur={() => setFocusedField(null)}
            className={`
              px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
              border ${focusedField === 'value' 
                ? 'border-indigo-500 ring-1 ring-indigo-500' 
                : 'border-gray-300 dark:border-gray-600'}
              focus:outline-none
              ${hasError ? 'border-red-500 dark:border-red-500' : ''}
            `}
            placeholder="Enter value"
          />
        );
    }
  };

  return (
    <motion.div 
      className={`
        p-3 rounded-md bg-white dark:bg-gray-800 shadow-sm
        border border-gray-200 dark:border-gray-700
        ${hasError ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10' : ''}
      `}
      whileHover={{ y: -2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
        {/* Field Selector */}
        <div className="w-full md:w-1/4">
          <select
            value={rule.field}
            onChange={(e) => handleFieldChange(e.target.value)}
            onFocus={() => setFocusedField('field')}
            onBlur={() => setFocusedField(null)}
            className={`
              w-full px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
              border ${focusedField === 'field' 
                ? 'border-indigo-500 ring-1 ring-indigo-500' 
                : 'border-gray-300 dark:border-gray-600'}
              focus:outline-none
              ${hasError ? 'border-red-500 dark:border-red-500' : ''}
            `}
          >
            <option value="" disabled>Select field</option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.label}
              </option>
            ))}
          </select>
        </div>
        {/* Operator Selector */}
        <div className="w-full md:w-1/4">
          <select
            value={rule.operator}
            onChange={(e) => handleOperatorChange(e.target.value)}
            onFocus={() => setFocusedField('operator')}
            onBlur={() => setFocusedField(null)}
            className={`
              w-full px-3 py-2 rounded-md text-sm bg-white dark:bg-gray-800
              border ${focusedField === 'operator' 
                ? 'border-indigo-500 ring-1 ring-indigo-500' 
                : 'border-gray-300 dark:border-gray-600'}
              focus:outline-none
              ${hasError ? 'border-red-500 dark:border-red-500' : ''}
            `}
          >
            {operators.map((operator) => (
              <option key={operator.id} value={operator.id}>
                {operator.label}
              </option>
            ))}
          </select>
        </div>
        {/* Value Input */}
        <div className="w-full md:w-1/4">
          {renderValueInput()}
        </div>
        {/* Delete Button */}
        <div className="w-full md:w-1/4 flex justify-end">
          <button
            type="button"
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
          >
            <IoTrash size={20} />
          </button>
        </div>
        </div>
        {/* Validation Error Message */}
        {hasError && (
          <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
            <IoWarningOutline className="mr-1" />
            <span>{errorMessage}</span>
          </div>
        )}
        </motion.div>
    );
}
export default RuleItem;
