/**
 * axios.ts - Axios HTTP client configuration
 * 
 * This module provides a pre-configured axios instance for making HTTP requests
 * to the backend API. It includes:
 * - Base URL configuration from environment variables
 * - Credentials (cookies) support for authentication
 * - Request/response interceptors for error handling
 * 
 * Usage:
 * import axios from './utils/axios';
 * const response = await axios.get('/endpoint');
 */

import axios from 'axios';

// Get backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - can add auth tokens, logging, etc.
axiosInstance.interceptors.request.use(
  (config) => {
    // You can modify request config here (e.g., add tokens)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response?.status === 401) {
      // Unauthorized - could redirect to login
      console.error('Unauthorized access');
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden');
    } else if (error.response?.status === 500) {
      // Server error
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
