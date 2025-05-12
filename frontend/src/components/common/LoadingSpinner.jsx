import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * LoadingSpinner component that displays an animated loading indicator
 * @param {Object} props
 * @param {string} [props.size='md'] - Size of spinner (sm, md, lg)
 * @param {string} [props.color='primary'] - Color theme (primary, secondary, white)
 * @param {boolean} [props.fullScreen=false] - Whether to display as overlay on full screen
 * @param {string} [props.message='Loading...'] - Optional loading message
 * @param {string} [props.lottieUrl] - URL to a DotLottie animation file (optional)
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  fullScreen = false,
  message = 'Loading...',
  lottieUrl = 'https://lottie.host/bff4e3e7-c751-4328-aaa8-4d7460e55ae8/SfrqSUvRhl.lottie' // Default loading animation
}) => {
  const [lottieError, setLottieError] = useState(false);
  
  // Size classes mapping
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };
  
  // Color classes mapping
  const colorClasses = {
    primary: 'text-indigo-600',
    secondary: 'text-teal-500',
    white: 'text-white',
  };

  // Fallback spinner in case Lottie fails
  const fallbackSpinner = (
    <motion.div 
      className={`${sizeClasses[size]} ${colorClasses[color]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <svg className="w-full h-full" viewBox="0 0 24 24">
        <motion.circle
          cx="12"
          cy="12" 
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
  
  // Lottie animation component with error handling
  const LottieAnimation = () => {
    if (lottieError) {
      return fallbackSpinner;
    }
    
    return (
      <div className={sizeClasses[size]}>
        <DotLottieReact
          src={lottieUrl}
          loop
          autoplay
          onError={() => setLottieError(true)}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  };
  
  // If fullScreen is true, display as an overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex flex-col items-center justify-center z-50">
        <LottieAnimation />
        {message && (
          <motion.p 
            className={`mt-4 ${colorClasses.white} text-lg font-medium`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    );
  }
  
  // Default inline spinner
  return (
    <div className="flex flex-col items-center">
      <LottieAnimation />
      {message && (
        <p className={`mt-2 ${colorClasses[color]} text-sm font-medium`}>{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;