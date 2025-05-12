import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoCheckmarkCircle, 
  IoWarning, 
  IoInformationCircle, 
  IoClose, 
  IoAlertCircle 
} from 'react-icons/io5';

// Toast container that holds all toast notifications
const ToastContainer = ({ position = 'top-right', children }) => {
  // Define position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={`fixed z-50 flex flex-col gap-3 ${positionClasses[position]}`}>
      <AnimatePresence>
        {children}
      </AnimatePresence>
    </div>
  );
};

/**
 * Individual Toast notification component
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the toast
 * @param {string} props.type - Toast type (success, error, warning, info)
 * @param {string} props.message - Toast message content
 * @param {number} [props.duration=5000] - Duration in ms before auto-close
 * @param {Function} props.onClose - Function to call to close the toast
 * @param {boolean} [props.hasProgress=true] - Whether to show progress bar
 */
const ToastItem = ({ 
  id, 
  type = 'info', 
  message, 
  duration = 5000, 
  onClose,
  hasProgress = true 
}) => {
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState(null);

  // Icon and color based on toast type
  const toastConfig = {
    success: {
      icon: <IoCheckmarkCircle className="w-6 h-6" />,
      bgColor: 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30',
      borderColor: 'border-l-4 border-green-500',
      textColor: 'text-green-700 dark:text-green-300',
      progressColor: 'bg-green-500'
    },
    error: {
      icon: <IoAlertCircle className="w-6 h-6" />,
      bgColor: 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30',
      borderColor: 'border-l-4 border-red-500',
      textColor: 'text-red-700 dark:text-red-300',
      progressColor: 'bg-red-500'
    },
    warning: {
      icon: <IoWarning className="w-6 h-6" />,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30',
      borderColor: 'border-l-4 border-yellow-500',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      progressColor: 'bg-yellow-500'
    },
    info: {
      icon: <IoInformationCircle className="w-6 h-6" />,
      bgColor: 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30',
      borderColor: 'border-l-4 border-blue-500',
      textColor: 'text-blue-700 dark:text-blue-300',
      progressColor: 'bg-blue-500'
    }
  };

  const { icon, bgColor, borderColor, textColor, progressColor } = toastConfig[type] || toastConfig.info;

  // Set up auto-dismiss and progress
  useEffect(() => {
    if (duration === 0) return; // No auto-dismiss if duration is 0

    // Update progress bar every 10ms
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose(id);
          return 0;
        }
        return prev - (100 / (duration / 10));
      });
    }, 10);

    setIntervalId(interval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [duration, id, onClose]);

  // Pause progress on hover
  const handleMouseEnter = () => {
    if (intervalId) clearInterval(intervalId);
  };

  // Resume progress on mouse leave
  const handleMouseLeave = () => {
    if (duration === 0) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose(id);
          return 0;
        }
        return prev - (100 / (duration / 10));
      });
    }, 10);

    setIntervalId(interval);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative flex w-80 min-h-16 shadow-lg rounded-lg ${bgColor} ${borderColor} overflow-hidden`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon */}
      <div className={`flex items-center justify-center pl-4 ${textColor}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pr-8">
        <p className={`${textColor} font-medium`}>{message}</p>
      </div>

      {/* Close Button */}
      <button
        className={`absolute top-2 right-2 p-1 rounded-full ${textColor} hover:bg-opacity-20 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        <IoClose className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      {hasProgress && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <motion.div
            className={`h-full ${progressColor}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.01, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Toast Context Setup
let toastCount = 0;
const toasts = [];
let setToastsState = () => {};

/**
 * Toast handler for creating global toast notifications
 */
export const toast = {
  _getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  },

  /**
   * Show a new toast notification
   * @param {Object} options - Toast options
   * @param {string} options.message - Toast message
   * @param {string} [options.type='info'] - Toast type (success, error, warning, info)
   * @param {number} [options.duration=5000] - Duration in ms (0 for no auto-close)
   * @param {boolean} [options.hasProgress=true] - Whether to show progress bar
   * @param {string} [options.position='top-right'] - Toast position
   * @returns {string} Toast ID
   */
  show({ message, type = 'info', duration = 5000, hasProgress = true, position = 'top-right' }) {
    const id = `toast-${toastCount++}`;
    const newToast = { id, message, type, duration, hasProgress, position };
    
    toasts.push(newToast);
    setToastsState([...toasts]);
    
    return id;
  },

  /**
   * Show a success toast
   * @param {string} message - Toast message
   * @param {Object} [options] - Additional toast options
   */
  success(message, options = {}) {
    return this.show({ message, type: 'success', ...options });
  },

  /**
   * Show an error toast
   * @param {string} message - Toast message
   * @param {Object} [options] - Additional toast options
   */
  error(message, options = {}) {
    return this.show({ message, type: 'error', ...options });
  },

  /**
   * Show a warning toast
   * @param {string} message - Toast message
   * @param {Object} [options] - Additional toast options
   */
  warning(message, options = {}) {
    return this.show({ message, type: 'warning', ...options });
  },

  /**
   * Show an info toast
   * @param {string} message - Toast message
   * @param {Object} [options] - Additional toast options
   */
  info(message, options = {}) {
    return this.show({ message, type: 'info', ...options });
  },

  /**
   * Remove a toast by ID
   * @param {string} id - Toast ID to remove
   */
  dismiss(id) {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.splice(index, 1);
      setToastsState([...toasts]);
    }
  },

  /**
   * Clear all toasts
   */
  clearAll() {
    toasts.length = 0;
    setToastsState([]);
  }
};

/**
 * Toast provider component to be placed at the app root
 */
const Toast = () => {
  const [toastState, setToasts] = useState([]);
  
  // Group toasts by position
  const groupedToasts = toastState.reduce((acc, toast) => {
    const { position = 'top-right' } = toast;
    if (!acc[position]) acc[position] = [];
    acc[position].push(toast);
    return acc;
  }, {});

  // Set the state updater function for the toast module
  useEffect(() => {
    setToastsState = setToasts;
    
    // Clean up when component unmounts
    return () => {
      setToastsState = () => {};
    };
  }, []);

  // Remove a toast
  const handleCloseToast = (id) => {
    toast.dismiss(id);
  };

  // Portal toast containers to the DOM
  return createPortal(
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <ToastContainer key={position} position={position}>
          {positionToasts.map((toast) => (
            <ToastItem
              key={toast.id}
              id={toast.id}
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              hasProgress={toast.hasProgress}
              onClose={handleCloseToast}
            />
          ))}
        </ToastContainer>
      ))}
    </>,
    document.body
  );
};

export default Toast;