import { useState, useCallback } from 'react';

/**
 * Custom hook for error handling with different error types and recovery mechanisms
 * @param {Object} options - Configuration options
 * @param {boolean} options.logErrors - Whether to log errors to console
 * @param {Function} options.onError - Callback function when error occurs
 * @returns {Object} Error state and handlers
 */
export const useError = (options = {}) => {
  const { logErrors = true, onError } = options;
  
  const [error, setError] = useState(null);
  const [isError, setIsError] = useState(false);
  const [errorHistory, setErrorHistory] = useState([]);

  /**
   * Handle different types of errors
   * @param {Error|string} errorData - Error object or message
   * @param {string} context - Context where error occurred
   * @param {string} severity - Error severity level
   */
  const handleError = useCallback((errorData, context = 'Unknown', severity = 'error') => {
    const errorObj = {
      id: Date.now() + Math.random(),
      message: typeof errorData === 'string' ? errorData : errorData?.message || 'An unknown error occurred',
      stack: errorData?.stack,
      context,
      severity,
      timestamp: new Date().toISOString(),
      code: errorData?.code,
      status: errorData?.status || errorData?.response?.status
    };

    setError(errorObj);
    setIsError(true);
    
    // Add to error history
    setErrorHistory(prev => [errorObj, ...prev.slice(0, 9)]); // Keep last 10 errors

    // Log error if enabled
    if (logErrors) {
      console.error(`[${severity.toUpperCase()}] ${context}:`, errorObj);
    }

    // Call optional error callback
    if (onError) {
      onError(errorObj);
    }
  }, [logErrors, onError]);

  /**
   * Handle API errors specifically
   * @param {Error} error - API error
   * @param {string} endpoint - API endpoint
   */
  const handleApiError = useCallback((error, endpoint = '') => {
    let message = 'Network error occurred';
    let severity = 'error';

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      switch (status) {
        case 400:
          message = 'Bad request - please check your input';
          break;
        case 401:
          message = 'Unauthorized - please log in again';
          break;
        case 403:
          message = 'Forbidden - you don\'t have permission';
          break;
        case 404:
          message = 'Resource not found';
          break;
        case 429:
          message = 'Too many requests - please try again later';
          severity = 'warning';
          break;
        case 500:
          message = 'Server error - please try again later';
          break;
        default:
          message = `Server error (${status})`;
      }
    } else if (error.request) {
      // Request made but no response
      message = 'Network connection failed - please check your internet';
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timeout - server is taking too long to respond';
      severity = 'warning';
    }

    handleError({
      ...error,
      message,
      originalMessage: error.message
    }, `API: ${endpoint}`, severity);
  }, [handleError]);

  /**
   * Handle chart/component rendering errors
   * @param {Error} error - Rendering error
   * @param {string} component - Component name
   */
  const handleComponentError = useCallback((error, component = 'Component') => {
    handleError(error, `${component} Render`, 'error');
  }, [handleError]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  /**
   * Clear all error history
   */
  const clearErrorHistory = useCallback(() => {
    setErrorHistory([]);
  }, []);

  /**
   * Retry function wrapper with error handling
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum retry attempts
   * @param {number} delay - Delay between retries in ms
   */
  const withRetry = useCallback(async (fn, maxRetries = 3, delay = 1000) => {
    // lastError intentionally omitted to avoid unused variable warnings
     
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
       try {
         return await fn();
       } catch (error) {
        // capture error and retry
         
         if (attempt === maxRetries) {
           handleError(error, `Retry failed after ${maxRetries} attempts`, 'error');
           throw error;
         }
         
         // Wait before retry
         await new Promise(resolve => setTimeout(resolve, delay * attempt));
       }
     }
   }, [handleError]);

  /**
   * Get user-friendly error message
   * @param {Object} errorObj - Error object
   * @returns {string} User-friendly message
   */
  const getErrorMessage = useCallback((errorObj = error) => {
    if (!errorObj) return '';
    
    // Return user-friendly messages based on error type
    if (errorObj.context?.includes('API')) {
      return errorObj.message;
    }
    
    if (errorObj.context?.includes('Render')) {
      return 'Failed to display component. Please refresh the page.';
    }
    
    return errorObj.message || 'An unexpected error occurred';
  }, [error]);

  /**
   * Check if error is recoverable
   * @param {Object} errorObj - Error object
   * @returns {boolean} Whether error is recoverable
   */
  const isRecoverable = useCallback((errorObj = error) => {
    if (!errorObj) return false;
    
    const recoverableStatuses = [408, 429, 500, 502, 503, 504];
    return recoverableStatuses.includes(errorObj.status) || 
           errorObj.severity === 'warning' ||
           errorObj.context?.includes('Network');
  }, [error]);

  return {
    // Error state
    error,
    isError,
    errorHistory,
    
    // Error handlers
    handleError,
    handleApiError,
    handleComponentError,
    
    // Error management
    clearError,
    clearErrorHistory,
    
    // Utilities
    withRetry,
    getErrorMessage,
    isRecoverable,
    
    // Error types for categorization
    severity: error?.severity || 'error',
    context: error?.context || 'Unknown'
  };
};