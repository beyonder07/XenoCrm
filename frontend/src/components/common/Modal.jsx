import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

/**
 * Modal component for displaying content in an overlay
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {string} [props.title] - Optional modal header title
 * @param {ReactNode} props.children - Content to display inside the modal
 * @param {string} [props.size='md'] - Size of the modal (sm, md, lg, xl, full)
 * @param {boolean} [props.closeOnClickOutside=true] - Whether clicking outside closes the modal
 * @param {ReactNode} [props.footer] - Optional footer content
 * @param {string} [props.className] - Additional CSS classes for the modal container
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnClickOutside = true,
  footer,
  className = '',
}) => {
  const modalRef = useRef(null);

  // Size class mapping
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleClickOutside = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClickOutside}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`${sizeClasses[size]} w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl ${className}`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  aria-label="Close modal"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                {footer}
              </div>
            )}

            {/* Close button (only shown if no title) */}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                aria-label="Close modal"
              >
                <IoClose className="w-6 h-6" />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;