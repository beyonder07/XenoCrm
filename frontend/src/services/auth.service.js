import api from './api';

const authService = {
  /**
   * Get current logged in user information
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const userData = await api.get('/auth/me');
      return userData;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  },

  /**
   * Logout user - clear token and any user data
   */
  logout() {
    localStorage.removeItem('token');
  },

  /**
   * Check if user is authenticated
   * @returns {Boolean} Authentication status
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Get Google OAuth URL
   * @returns {Promise<String>} Google OAuth URL
   */
  async getGoogleAuthUrl() {
    try {
      // First try to get URL from API
      const response = await api.get('/auth/google/url');
      
      if (response && response.url) {
        return response.url;
      } else {
        // Fallback to direct URL if API doesn't return a URL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        return `${apiUrl}/auth/google`;
      }
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      // Fallback to direct URL if API call fails
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      return `${apiUrl}/auth/google`;
    }
  },

  /**
   * Handle OAuth callback - process token
   * @param {String} token JWT token
   * @returns {Promise<Object>} User data
   */
  async handleOAuthCallback(token) {
    if (!token) throw new Error('No token provided');
    
    // Store the token
    localStorage.setItem('token', token);
    
    // Get user data
    return await this.getCurrentUser();
  },

  /**
   * Login with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} User data
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response.data.user;
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} userData.passwordConfirm - Password confirmation
   * @returns {Promise<Object>} User data
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response.data.user;
  }
};

export default authService;