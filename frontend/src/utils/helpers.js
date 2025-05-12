/**
 * Debounce a function to limit how often it can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * Throttle a function to limit how often it can be called
   * @param {Function} func - Function to throttle
   * @param {number} limit - Milliseconds to limit
   * @returns {Function} Throttled function
   */
  export const throttle = (func, limit = 300) => {
    let inThrottle;
    
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  };
  
  /**
   * Generate a unique ID
   * @returns {string} Unique ID
   */
  export const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  
  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  /**
   * Format campaign message with customer data
   * @param {string} message - Message template
   * @param {Object} customer - Customer data
   * @returns {string} Formatted message
   */
  export const formatMessage = (message, customer) => {
    if (!message || !customer) return message;
    
    let formattedMessage = message;
    
    // Replace {{name}} with customer name
    formattedMessage = formattedMessage.replace(/{{name}}/g, customer.name || '');
    
    // Replace other placeholders as needed
    formattedMessage = formattedMessage.replace(/{{email}}/g, customer.email || '');
    formattedMessage = formattedMessage.replace(/{{location}}/g, customer.location || '');
    
    return formattedMessage;
  };
  
  /**
   * Group array of objects by a property
   * @param {Array} array - Array to group
   * @param {string} key - Key to group by
   * @returns {Object} Grouped object
   */
  export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      result[groupKey] = [...(result[groupKey] || []), item];
      return result;
    }, {});
  };
  
  /**
   * Get contrasting text color (black/white) based on background color
   * @param {string} bgColor - Background color hex
   * @returns {string} Text color (black or white)
   */
  export const getContrastColor = (bgColor) => {
    // Remove # if present
    const hex = bgColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for bright colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };
  
  /**
   * Check if user has required permission
   * @param {Array} userPermissions - User's permissions
   * @param {string} requiredPermission - Required permission
   * @returns {boolean} Whether user has permission
   */
  export const hasPermission = (userPermissions, requiredPermission) => {
    if (!userPermissions || !Array.isArray(userPermissions)) return false;
    
    return userPermissions.includes(requiredPermission);
  };
  
  /**
   * Convert object to query string
   * @param {Object} params - Object of parameters
   * @returns {string} Query string
   */
  export const toQueryString = (params) => {
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(val => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');
  };
  
  /**
   * Download data as a file
   * @param {Object|Array} data - Data to download
   * @param {string} filename - File name
   * @param {string} type - File type (json, csv)
   */
  export const downloadFile = (data, filename, type = 'json') => {
    let content;
    let mimeType;
    
    if (type === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
    } else if (type === 'csv') {
      // Convert to CSV if data is an array of objects
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => Object.values(item).map(value => {
          // Wrap string values with quotes and handle commas
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(','));
        
        content = [headers, ...rows].join('\n');
      } else {
        content = '';
      }
      mimeType = 'text/csv';
    } else {
      content = String(data);
      mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  /**
   * Delay execution with a promise
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  /**
   * Get initials from name
   * @param {string} name - Full name
   * @returns {string} Initials
   */
  export const getInitials = (name) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substr(0, 2);
  };