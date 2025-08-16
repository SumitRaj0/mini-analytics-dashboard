import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing notifications with different types and auto-dismiss
 * @param {Object} options - Configuration options
 * @param {number} options.defaultDuration - Default auto-dismiss duration in ms
 * @param {number} options.maxNotifications - Maximum notifications to show
 * @returns {Object} Notification state and handlers
 */
export const useNotification = (options = {}) => {
  const { defaultDuration = 4000, maxNotifications = 5 } = options;
  
  const [notifications, setNotifications] = useState([]);
  const timeoutRefs = useRef(new Map());

  /**
   * Show a notification
   * @param {Object} notificationData - Notification configuration
   * @param {string} notificationData.type - Type of notification (success, error, warning, info, loading)
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.message - Notification message
   * @param {number} notificationData.duration - Auto-dismiss duration (0 for persistent)
   * @param {boolean} notificationData.closable - Whether notification can be closed manually
   * @param {Object} notificationData.action - Action button configuration
   * @param {Function} notificationData.onClose - Callback when notification closes
   * @returns {string} Notification ID
   */
  const show = useCallback((notificationData) => {
    const {
      type = 'info',
      title,
      message,
      duration = defaultDuration,
      closable = true,
      action,
      onClose,
      progress = null
    } = notificationData;

    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    const notification = {
      id,
      type,
      title,
      message,
      duration,
      closable,
      action,
      onClose,
      progress,
      timestamp: new Date(),
      isVisible: true
    };

    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      // Keep only max notifications
      return newNotifications.slice(0, maxNotifications);
    });

    // Auto-dismiss if duration is set
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        dismiss(id);
      }, duration);
      
      timeoutRefs.current.set(id, timeoutId);
    }

    return id;
  }, [defaultDuration, maxNotifications]);

  /**
   * Dismiss a notification
   * @param {string} id - Notification ID
   */
  const dismiss = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification?.onClose) {
        notification.onClose();
      }
      return prev.filter(n => n.id !== id);
    });

    // Clear timeout if exists
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
  }, []);

  /**
   * Update notification progress
   * @param {string} id - Notification ID
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} message - Optional message update
   */
  const updateProgress = useCallback((id, progress, message) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { 
              ...notification, 
              progress: Math.max(0, Math.min(100, progress)),
              ...(message && { message })
            }
          : notification
      )
    );
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    // Call onClose for all notifications
    notifications.forEach(notification => {
      if (notification.onClose) {
        notification.onClose();
      }
    });

    setNotifications([]);
    
    // Clear all timeouts
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
  }, [notifications]);

  // Specific notification type helpers
  const success = useCallback((title, message, options = {}) => {
    return show({
      type: 'success',
      title,
      message,
      duration: 3000,
      ...options
    });
  }, [show]);

  const error = useCallback((title, message, options = {}) => {
    return show({
      type: 'error',
      title,
      message,
      duration: 6000,
      ...options
    });
  }, [show]);

  const warning = useCallback((title, message, options = {}) => {
    return show({
      type: 'warning',
      title,
      message,
      duration: 5000,
      ...options
    });
  }, [show]);

  const info = useCallback((title, message, options = {}) => {
    return show({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [show]);

  const loading = useCallback((title, message, options = {}) => {
    return show({
      type: 'loading',
      title,
      message,
      duration: 0, // Persistent by default
      closable: false,
      ...options
    });
  }, [show]);

  // Download-specific helpers
  const downloadStart = useCallback((filename) => {
    return loading(
      'Preparing Download',
      `Preparing ${filename} for download...`,
      { progress: 0 }
    );
  }, [loading]);

  const downloadProgress = useCallback((id, progress, filename) => {
    updateProgress(id, progress, `Downloading ${filename}... ${Math.round(progress)}%`);
  }, [updateProgress]);

  const downloadSuccess = useCallback((id, filename) => {
    dismiss(id);
    return success(
      'Download Complete',
      `${filename} has been downloaded successfully`,
      { duration: 3000 }
    );
  }, [dismiss, success]);

  const downloadError = useCallback((id, filename, errorMessage) => {
    dismiss(id);
    return error(
      'Download Failed',
      `Failed to download ${filename}: ${errorMessage}`,
      { 
        duration: 6000,
        action: {
          label: 'Retry',
          onClick: () => {/* Retry logic would be passed here */}
        }
      }
    );
  }, [dismiss, error]);

  // Export-specific helpers
  const exportStart = useCallback((type, format) => {
    return loading(
      `Exporting ${type}`,
      `Preparing ${format.toUpperCase()} export...`,
      { progress: 0 }
    );
  }, [loading]);

  const exportSuccess = useCallback((id, type, format) => {
    dismiss(id);
    return success(
      'Export Complete',
      `${type} exported as ${format.toUpperCase()} successfully`,
      { 
        duration: 3000,
        action: {
          label: 'Download Another',
          onClick: () => {/* Could trigger export menu */}
        }
      }
    );
  }, [dismiss, success]);

  const copySuccess = useCallback((content = 'Link') => {
    return success(
      'Copied!',
      `${content} copied to clipboard`,
      { duration: 2000 }
    );
  }, [success]);

  // API operation helpers
  const apiStart = useCallback((operation) => {
    return loading(
      'Processing',
      `${operation}...`
    );
  }, [loading]);

  const apiSuccess = useCallback((id, operation) => {
    dismiss(id);
    return success(
      'Success',
      `${operation} completed successfully`,
      { duration: 2000 }
    );
  }, [dismiss, success]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, []);

  return {
    // State
    notifications,
    
    // Core methods
    show,
    dismiss,
    updateProgress,
    clearAll,
    
    // Type-specific helpers
    success,
    error,
    warning,
    info,
    loading,
    
    // Download-specific helpers
    downloadStart,
    downloadProgress,
    downloadSuccess,
    downloadError,
    
    // Export-specific helpers
    exportStart,
    exportSuccess,
    copySuccess,
    
    // API-specific helpers
    apiStart,
    apiSuccess,
    
    // Utility
    count: notifications.length,
    hasNotifications: notifications.length > 0
  };
};