import React from 'react';
import { motion } from 'framer-motion';

const Input = ({
  id,
  name,
  label,
  type = 'text',
  value,
  placeholder = '',
  className = '',
  labelClassName = '',
  error = '',
  disabled = false,
  required = false,
  icon,
  onChange,
  onBlur,
  ...props
}) => {
  const iconClasses = icon ? 'pl-10' : '';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <motion.input
          id={id || name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onBlur={onBlur}
          className={`block w-full rounded-md shadow-sm text-gray-900 ${iconClasses} ${errorClasses} ${disabledClasses} sm:text-sm`}
          whileFocus={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 300 }}
          {...props}
        />
      </div>
      {error && (
        <motion.p 
          className="mt-1 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Create a Textarea variant of Input
export const Textarea = ({
  id,
  name,
  label,
  value,
  placeholder = '',
  className = '',
  labelClassName = '',
  error = '',
  disabled = false,
  required = false,
  rows = 3,
  onChange,
  onBlur,
  ...props
}) => {
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <motion.textarea
        id={id || name}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        onChange={onChange}
        onBlur={onBlur}
        className={`block w-full rounded-md shadow-sm text-gray-900 ${errorClasses} ${disabledClasses} sm:text-sm`}
        whileFocus={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300 }}
        {...props}
      />
      {error && (
        <motion.p 
          className="mt-1 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Create a Select variant of Input
export const Select = ({
  id,
  name,
  label,
  value,
  options = [],
  placeholder = 'Select an option',
  className = '',
  labelClassName = '',
  error = '',
  disabled = false,
  required = false,
  onChange,
  onBlur,
  ...props
}) => {
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <motion.select
        id={id || name}
        name={name}
        value={value}
        disabled={disabled}
        required={required}
        onChange={onChange}
        onBlur={onBlur}
        className={`block w-full rounded-md shadow-sm text-gray-900 ${errorClasses} ${disabledClasses} sm:text-sm`}
        whileFocus={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 300 }}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </motion.select>
      {error && (
        <motion.p 
          className="mt-1 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;