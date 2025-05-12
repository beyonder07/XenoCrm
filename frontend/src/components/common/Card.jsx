import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  title, 
  subtitle,
  icon,
  className = '',
  padding = 'normal',
  shadow = 'md',
  hover = false,
  onClick,
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-3',
    normal: 'p-5',
    large: 'p-6'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg'
  };
  
  const baseClasses = 'bg-white rounded-lg border border-gray-100';
  const hoverClasses = hover ? 'transition-all duration-300 cursor-pointer' : '';
  
  const cardVariants = hover ? {
    initial: { y: 0 },
    hover: { y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }
  } : {};

  return (
    <motion.div
      className={`${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? "hover" : undefined}
      variants={cardVariants}
      {...props}
    >
      {(title || subtitle || icon) && (
        <div className="mb-4">
          {icon && <div className="mb-2">{icon}</div>}
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default Card;