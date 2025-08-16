import React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X
} from 'lucide-react';

const NotificationContainer = ({ notifications, onDismiss }) => {
  if (!notifications.length) return null;

  const getIcon = (type) => {
    const iconProps = { size: 20, className: "flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="text-green-600 dark:text-green-400" />;
      case 'error':
        return <XCircle {...iconProps} className="text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-yellow-600 dark:text-yellow-400" />;
      case 'loading':
        return <Loader2 {...iconProps} className="text-blue-600 dark:text-blue-400 animate-spin" />;
      default:
        return <Info {...iconProps} className="text-blue-600 dark:text-blue-400" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'loading':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-900 dark:text-green-100';
      case 'error':
        return 'text-red-900 dark:text-red-100';
      case 'warning':
        return 'text-yellow-900 dark:text-yellow-100';
      case 'loading':
        return 'text-blue-900 dark:text-blue-100';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            relative overflow-hidden rounded-lg border shadow-lg
            ${getBackgroundColor(notification.type)}
            ${getTextColor(notification.type)}
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full
          `}
        >
          {/* Progress bar for loading notifications */}
          {notification.progress !== null && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${notification.progress}%` }}
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="mt-0.5">
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {notification.title && (
                  <div className="font-medium text-sm mb-1">
                    {notification.title}
                  </div>
                )}
                {notification.message && (
                  <div className="text-sm opacity-90">
                    {notification.message}
                  </div>
                )}

                {/* Action button */}
                {notification.action && (
                  <div className="mt-3">
                    <button
                      onClick={notification.action.onClick}
                      className="inline-flex items-center gap-1 text-xs font-medium hover:underline focus:outline-none focus:underline"
                    >
                      {notification.action.label}
                      {notification.action.icon && (
                        <span className="ml-1">
                          {notification.action.icon}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Close button */}
              {notification.closable && (
                <button
                  onClick={() => onDismiss(notification.id)}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity p-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-gray-400"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Download progress specific styling */}
          {notification.type === 'loading' && notification.progress !== null && (
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between text-xs opacity-75">
                <span>Progress</span>
                <span>{Math.round(notification.progress)}%</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;