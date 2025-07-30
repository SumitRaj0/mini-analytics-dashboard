import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console for development
    console.error('Error Boundary caught an error:', error, errorInfo);

    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, or custom error service
      // errorReportingService.logError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback, level = 'component' } = this.props;

      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
          />
        );
      }

      // Different error UI based on error level
      if (level === 'page') {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Oops! Something went wrong
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </p>

                {/* Error details in development */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Error Details (Dev Mode)
                    </summary>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono text-red-600 dark:text-red-400 overflow-auto max-h-32">
                      {this.state.error.toString()}
                    </div>
                  </details>
                )}

                <div className="space-y-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full btn-primary"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Try Again
                  </button>
                  
                  <button
                    onClick={this.handleReload}
                    className="w-full btn border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Reload Page
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="w-full btn border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Home size={16} className="mr-2" />
                    Go to Homepage
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Error ID: {this.state.errorId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Component-level error UI
      return (
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg p-6 m-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Component Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>This component encountered an error and couldn't render properly.</p>
              </div>
              
              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-red-600 dark:text-red-400">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              
              <div className="mt-4">
                <button
                  onClick={this.handleRetry}
                  className="text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <RefreshCw size={12} className="mr-1 inline" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for hooks
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Chart-specific error fallback
export const ChartErrorFallback = ({ error, onRetry }) => (
  <div className="card flex items-center justify-center h-64">
    <div className="text-center">
      <Bug className="h-8 w-8 text-gray-400 mx-auto mb-3" />
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        Chart Error
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        Unable to render chart data
      </p>
      <button
        onClick={onRetry}
        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        <RefreshCw size={12} className="mr-1 inline" />
        Retry
      </button>
    </div>
  </div>
);

export default ErrorBoundary; 