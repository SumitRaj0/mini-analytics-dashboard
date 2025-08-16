import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// If running in development and no backend present, point to the mock DB served by the dev server
if (process.env.NODE_ENV === 'development') {
  // react-scripts serves static files from public/, so we expose mock JSON via relative path
  api.defaults.baseURL = process.env.REACT_APP_API_URL || '/mock-db';
}

// Request interceptor to prevent caching
api.interceptors.request.use(
  (config) => {
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error;
  }
);

// Analytics API service
export const analyticsService = {
  // Get analytics data
  getAnalytics: () => api.get(process.env.NODE_ENV === 'development' ? '/analytics.json' : '/analytics'),
  
  // Get performance chart data
  getPerformanceChart: () => api.get(process.env.NODE_ENV === 'development' ? '/performance-chart.json' : '/analytics/performance-chart'),
  
  // Health check
  healthCheck: () => api.get(process.env.NODE_ENV === 'development' ? '/health.json' : '/health'),
};

export default api;