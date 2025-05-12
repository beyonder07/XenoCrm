import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = 
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    }
    
    // Handle server errors
    else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    // Handle validation errors
    else if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors) {
        Object.values(validationErrors).forEach((errorMsg) => {
          toast.error(errorMsg);
        });
      } else {
        toast.error(message);
      }
    }
    
    // Handle other client errors
    else if (error.response?.status >= 400 && error.response?.status < 500) {
      toast.error(message);
    }
    
    // Handle network errors
    else if (error.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check your connection.');
    }
    
    // Handle other errors
    else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;