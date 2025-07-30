import React, { useState } from 'react';
import { Info } from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  unit = '', 
  trend = null, 
  description = '', 
  isPercentage = false,
  isLoading = false,
  size = 'default'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (isLoading) {
    return (
      <div className={`metric-card ${size === 'large' ? 'sm:col-span-2' : ''}`}>
        <div className="animate-pulse">
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-24 mb-2"></div>
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16 mb-1"></div>
          <div className="h-2 sm:h-3 bg-gray-200 rounded w-20 sm:w-32"></div>
        </div>
      </div>
    );
  }

  const getTrendBadge = () => {
    if (trend === null || trend === undefined) return null;
    
    const isPositive = trend > 0;
    const isNeutral = trend === 0;
    
    if (isNeutral) {
      return <span className="badge-neutral text-xs">No Change</span>;
    }
    
    return (
      <span className={`text-xs ${isPositive ? 'badge-success' : 'badge-danger'}`}>
        {isPositive ? '+' : ''}{trend}{isPercentage ? '%' : ''}
      </span>
    );
  };

  const getValueColor = () => {
    if (typeof value === 'number') {
      if (title.toLowerCase().includes('loss') || title.toLowerCase().includes('drawdown')) {
        return value > 0 ? 'text-danger-600' : 'text-gray-900';
      }
      if (title.toLowerCase().includes('win') || title.toLowerCase().includes('profit')) {
        return value > 0 ? 'text-success-600' : 'text-danger-600';
      }
      return value > 0 ? 'text-success-600' : value < 0 ? 'text-danger-600' : 'text-gray-900';
    }
    return 'text-gray-900';
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (title.toLowerCase().includes('rate') || isPercentage) {
        return `${val.toFixed(2)}%`;
      }
      if (title.toLowerCase().includes('factor') || title.toLowerCase().includes('ratio')) {
        return val.toFixed(2);
      }
      if (title.toLowerCase().includes('pnl') || title.toLowerCase().includes('profit')) {
        const absVal = Math.abs(val);
        const formattedVal = absVal >= 1000 ? 
          `${(absVal / 1000).toFixed(1)}K` : 
          absVal.toLocaleString();
        return val >= 0 ? `$${formattedVal}` : `-$${formattedVal}`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className={`metric-card relative ${size === 'large' ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</h3>
            {description && (
              <div className="relative flex-shrink-0">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setShowTooltip(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label="More information"
                >
                  <Info size={12} className="sm:w-4 sm:h-4" />
                </button>
                {showTooltip && (
                  <div className="absolute z-20 w-48 sm:w-64 p-2 mt-1 text-xs text-white bg-gray-900 rounded-lg shadow-lg -left-20 sm:-left-24 top-full">
                    {description}
                    <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -top-1 left-1/2 -translate-x-1/2"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
            <span className={`text-lg sm:text-2xl font-bold ${getValueColor()} break-all`}>
              {formatValue(value)}
            </span>
            {unit && <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">{unit}</span>}
          </div>
          
          {getTrendBadge() && (
            <div className="mt-1 sm:mt-2">
              {getTrendBadge()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard; 