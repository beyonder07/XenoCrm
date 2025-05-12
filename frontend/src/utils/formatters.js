/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Default options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date);
  };
  
  /**
   * Format a number with comma separators and currency symbol
   * @param {number} value - Numeric value
   * @param {string} currency - Currency code
   * @returns {string} Formatted currency value
   */
  export const formatCurrency = (value, currency = 'INR') => {
    if (value === null || value === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  /**
   * Format a number with comma separators
   * @param {number} value - Numeric value
   * @returns {string} Formatted number
   */
  export const formatNumber = (value) => {
    if (value === null || value === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-IN').format(value);
  };
  
  /**
   * Format a percentage value
   * @param {number} value - Percentage value (e.g., 0.75 for 75%)
   * @returns {string} Formatted percentage
   */
  export const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  };
  
  /**
   * Calculate and format time ago from a date string
   * @param {string} dateString - ISO date string
   * @returns {string} Time ago string (e.g., "5 minutes ago")
   */
  export const timeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    // Time intervals in seconds
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    // Calculate the appropriate interval
    if (seconds < 60) {
      return 'just now';
    }
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  };
  
  /**
   * Truncate a string to a specified length
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated string
   */
  export const truncateString = (str, length = 50) => {
    if (!str) return '';
    
    if (str.length <= length) return str;
    
    return `${str.substring(0, length)}...`;
  };
  
  /**
   * Convert bytes to human-readable file size
   * @param {number} bytes - File size in bytes
   * @returns {string} Human-readable file size
   */
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };
  
  /**
   * Format a phone number
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone number
   */
  export const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    
    // Basic formatting for Indian phone numbers
    if (phone.startsWith('+91')) {
      const digits = phone.replace(/\D/g, '');
      return `+91 ${digits.substring(2, 7)} ${digits.substring(7)}`;
    }
    
    return phone;
  };