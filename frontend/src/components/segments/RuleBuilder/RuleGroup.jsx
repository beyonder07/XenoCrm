import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoAddCircle } from 'react-icons/io5';
import RuleBuilder from './RuleBuilder';

const RuleGroup = ({ rules, onChange, fieldOptions, getOperatorOptions, disabled = false }) => {
  // Add a new condition
  const handleAddCondition = () => {
    const newCondition = {
      id: `rule_${Date.now()}`,
      field: '',
      operator: '',
      value: ''
    };
    
    onChange({
      ...rules,
      conditions: [...rules.conditions, newCondition]
    });
  };

  // Update a condition at a specific index
  const handleUpdateCondition = (updatedCondition, index) => {
    const newConditions = [...rules.conditions];
    newConditions[index] = updatedCondition;
    
    onChange({
      ...rules,
      conditions: newConditions
    });
  };

  // Remove a condition at a specific index
  const handleRemoveCondition = (index) => {
    onChange({
      ...rules,
      conditions: rules.conditions.filter((_, i) => i !== index)
    });
  };

  return (
    <div>
      <AnimatePresence mode="popLayout">
        {rules.conditions.map((condition, index) => (
          <RuleBuilder
            key={condition.id || index}
            rule={condition}
            index={index}
            onUpdate={handleUpdateCondition}
            onRemove={handleRemoveCondition}
            fieldOptions={fieldOptions}
            getOperatorOptions={getOperatorOptions}
            disabled={disabled}
          />
        ))}
      </AnimatePresence>

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
  );
};

export default RuleGroup;