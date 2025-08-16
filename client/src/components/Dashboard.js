import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, Play, Pause, TrendingUp, Download, FileText, Share2 } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { useError } from '../hooks/useError';
import { useZoomScale } from '../hooks/useZoomScale';
import { exportToCSV, exportToPDF, formatDataForExport, generateShareableSnapshot } from '../utils/exportUtils';
import ErrorBoundary, { ChartErrorFallback } from './ErrorBoundary';
import NotificationContainer from './ui/NotificationContainer';
import MetricCard from './ui/MetricCard';
import PerformanceChart from './PerformanceChart';
import RecentTrades from './RecentTrades';
import WinRateChart from './WinRateChart';
import ProfitDistributionChart from './ProfitDistributionChart';
import MonthlyPerformanceChart from './MonthlyPerformanceChart';
import AssetAllocationChart from './AssetAllocationChart';
import { analyticsService } from '../services/api';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const { 
    notifications, 
    dismiss: dismissNotification,
    exportStart, 
    exportSuccess, 
    copySuccess,
    error: showErrorNotification 
  } = useNotification();
  const { handleApiError, clearError } = useError();
  const { scaleFactor } = useZoomScale();

  const fetchAnalytics = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      clearError();
      
      const [analyticsResponse, chartResponse] = await Promise.all([
        analyticsService.getAnalytics(),
        analyticsService.getPerformanceChart()
      ]);

      setAnalytics(analyticsResponse.data.data);
      setChartData(chartResponse.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err.message || 'Failed to load analytics data';
      setError(errorMessage);
      handleApiError(err, '/analytics');
      console.error('Dashboard fetch error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [handleApiError, clearError]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAnalytics(false); // Don't show loading for auto-refresh
      }, 30000); // Refresh every 30 seconds
      
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, fetchAnalytics]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + R: Refresh
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        handleManualRefresh();
      }

      // Ctrl/Cmd + E: Export CSV
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        handleExportCSV();
      }
      // Ctrl/Cmd + P: Export PDF
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        handleExportPDF();
      }
      // Escape: Close export menu
      if (event.key === 'Escape') {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [analytics, chartData]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-menu')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleManualRefresh = () => {
    fetchAnalytics(true);
  };

  // Export handlers
  const handleExportCSV = () => {
    if (!analytics) return;
    
    const filename = `trading-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    const notificationId = exportStart('Analytics Data', 'CSV');
    
    try {
      const data = formatDataForExport(analytics, chartData, analytics.recentTrades);
      const success = exportToCSV(data, filename);
      
      if (success) {
        exportSuccess(notificationId, 'Analytics Data', 'CSV');
        setShowExportMenu(false);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      showErrorNotification('Export Failed', `Failed to export CSV: ${error.message}`);
    }
  };

  const handleExportPDF = () => {
    const notificationId = exportStart('Analytics Report', 'PDF');
    
    try {
      const success = exportToPDF();
      
      if (success) {
        exportSuccess(notificationId, 'Analytics Report', 'PDF');
        setShowExportMenu(false);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      showErrorNotification('Export Failed', `Failed to export PDF: ${error.message}`);
    }
  };

  const handleShareSnapshot = async () => {
    if (!analytics) return;
    
    try {
      const data = formatDataForExport(analytics, chartData, analytics.recentTrades);
      const shareUrl = generateShareableSnapshot(data);
      
      if (shareUrl) {
        copySuccess('Share link');
        setShowExportMenu(false);
      } else {
        throw new Error('Failed to generate share link');
      }
    } catch (error) {
      showErrorNotification('Share Failed', `Failed to create share link: ${error.message}`);
    }
  };

  // Full page loader for initial load
  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-primary-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Loading Analytics Dashboard</h2>
          <p className="text-gray-600">Fetching your trading performance data...</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Unable to Load Dashboard
            </h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error}</p>
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <RefreshCw size={18} className="mr-2 animate-spin" />
              ) : (
                <RefreshCw size={18} className="mr-2" />
              )}
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="dashboard-container min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
      style={{
        transform: scaleFactor !== 1.0 ? `scale(${scaleFactor})` : 'none',
        transformOrigin: 'top left',
        width: '100%',
        height: '100vh'
      }}
    >
      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
      {/* Enhanced Professional Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40 shadow-sm">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 lg:py-0 sm:h-16 lg:h-18 gap-3 sm:gap-4 lg:gap-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                                 <div>
                   <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                     Trading Analytics
                   </h1>
                   <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                     Performance metrics • {analytics?.totalTrades} trades
                   </p>
                 </div>
              </div>
            </div>
                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
               {lastUpdated && (
                 <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 order-4 sm:order-1">
                   <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                   Last updated: {lastUpdated.toLocaleTimeString()}
                 </div>
               )}
               
               <div className="flex items-center gap-2 order-1 sm:order-2">
                 {/* Export Menu */}
                 <div className="relative export-menu">
                   <button
                     onClick={() => setShowExportMenu(!showExportMenu)}
                     className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                     title="Export data (Ctrl+E for CSV)"
                   >
                     <Download size={20} />
                   </button>
                   
                   {showExportMenu && (
                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                       <button
                         onClick={handleExportCSV}
                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                       >
                         <FileText size={14} />
                         Export CSV
                         <span className="ml-auto text-xs text-gray-400">Ctrl+E</span>
                       </button>
                       <button
                         onClick={handleExportPDF}
                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                       >
                         <FileText size={14} />
                         Export PDF
                         <span className="ml-auto text-xs text-gray-400">Ctrl+P</span>
                       </button>
                       <button
                         onClick={handleShareSnapshot}
                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                       >
                         <Share2 size={14} />
                         Share Snapshot
                       </button>
                     </div>
                   )}
                 </div>
               </div>
               
               <div className="flex items-center gap-2 order-2 sm:order-3">
                 <button
                   onClick={toggleAutoRefresh}
                   className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                     autoRefresh 
                       ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                   }`}
                 >
                   {autoRefresh ? <Pause size={16} /> : <Play size={16} />}
                   {autoRefresh ? 'Auto' : 'Auto'}
                 </button>
                 
                 <button
                   onClick={handleManualRefresh}
                   disabled={loading}
                   className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-transform transform ${loading ? 'opacity-80 cursor-wait' : 'shadow-md hover:-translate-y-0.5'} ${loading ? 'bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'} text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                   title="Refresh data (Ctrl+R)"
                 >
                   <RefreshCw 
                     size={16} 
                     className={`mr-1 ${loading ? 'animate-spin' : ''}`} 
                   />
                   <span>Refresh</span>
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Key Metrics Grid - Enhanced Design */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="Win Rate"
            value={analytics?.winRate}
            description="Percentage of profitable trades out of total trades"
            isPercentage={true}
            isLoading={loading}
            trend={2.5}
          />
          <MetricCard
            title="Profit Factor"
            value={analytics?.profitFactor}
            description="Ratio of gross profits to gross losses"
            isLoading={loading}
            trend={0.15}
          />
          <MetricCard
            title="Average Return"
            value={analytics?.averageReturn}
            description="Average percentage return per trade"
            isPercentage={true}
            isLoading={loading}
            trend={-0.8}
          />
          <MetricCard
            title="Sharpe Ratio"
            value={analytics?.sharpeRatio}
            description="Risk-adjusted return performance metric"
            isLoading={loading}
            trend={0.12}
          />
        </div>

        {/* Secondary Metrics - Professional Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
          <MetricCard
            title="Total Trades"
            value={analytics?.totalTrades}
            description="Total number of completed trades"
            isLoading={loading}
          />
          <MetricCard
            title="Winning Trades"
            value={analytics?.winningTrades}
            description="Number of profitable trades"
            isLoading={loading}
          />
          <MetricCard
            title="Losing Trades"
            value={analytics?.losingTrades}
            description="Number of loss-making trades"
            isLoading={loading}
          />
          <MetricCard
            title="Max Win Streak"
            value={analytics?.longestWinStreak}
            description="Maximum consecutive profitable trades"
            isLoading={loading}
          />
          <MetricCard
            title="Max Loss Streak"
            value={analytics?.longestLossStreak}
            description="Maximum consecutive losing trades"
            isLoading={loading}
          />
        </div>

        {/* P&L and Drawdown - Enhanced Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="Total P&L"
            value={analytics?.netProfit}
            description="Total profit or loss across all trades"
            isLoading={loading}
          />
          <MetricCard
            title="Maximum Drawdown"
            value={analytics?.maxDrawdown}
            description="Largest percentage drop from peak to trough"
            isPercentage={true}
            isLoading={loading}
          />
        </div>

                 {/* Enhanced Charts Section */}
         <div className="space-y-6 sm:space-y-8">
           {/* Main Performance Chart */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
             <div className="xl:col-span-2">
               <ErrorBoundary fallback={ChartErrorFallback}>
                 <PerformanceChart 
                   data={chartData} 
                   isLoading={loading}
                   type="area"
                 />
               </ErrorBoundary>
             </div>
             <div>
               <ErrorBoundary fallback={ChartErrorFallback}>
                 <WinRateChart 
                   data={analytics} 
                   isLoading={loading}
                 />
               </ErrorBoundary>
             </div>
           </div>

           {/* Additional Professional Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
             <ErrorBoundary fallback={ChartErrorFallback}>
               <ProfitDistributionChart 
                 trades={analytics?.recentTrades} 
                 isLoading={loading}
               />
             </ErrorBoundary>
             <ErrorBoundary fallback={ChartErrorFallback}>
               <AssetAllocationChart 
                 trades={analytics?.recentTrades} 
                 isLoading={loading}
               />
             </ErrorBoundary>
           </div>

           {/* Monthly Performance Chart */}
           <div className="w-full">
             <ErrorBoundary fallback={ChartErrorFallback}>
               <MonthlyPerformanceChart 
                 data={chartData} 
                 isLoading={loading}
               />
             </ErrorBoundary>
           </div>

           {/* Recent Trades - Full Width */}
           <div className="w-full">
             <ErrorBoundary fallback={ChartErrorFallback}>
               <RecentTrades 
                 trades={analytics?.recentTrades} 
                 isLoading={loading}
               />
             </ErrorBoundary>
           </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;