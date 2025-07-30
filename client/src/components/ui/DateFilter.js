import React, { useState } from 'react';
import { 
  Calendar, 
  SortAsc, 
  SortDesc, 
  Filter, 
  X, 
  ChevronDown,
  Clock,
  CheckCircle2
} from 'lucide-react';

const DateFilter = ({ 
  sortOrder, 
  filterType, 
  dateRangeText, 
  filterStats,
  onToggleSort, 
  onFilterTypeChange, 
  onClearFilters,
  hasActiveFilters,
  className = '' 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const filterOptions = [
    { key: 'all', label: 'All Time', icon: <Calendar size={14} /> },
    { key: 'today', label: 'Today', icon: <Clock size={14} /> },
    { key: 'week', label: 'This Week', icon: <Calendar size={14} /> },
    { key: 'month', label: 'This Month', icon: <Calendar size={14} /> }
  ];

  const getSortIcon = () => {
    return sortOrder === 'asc' ? 
      <SortAsc size={16} className="text-blue-600 dark:text-blue-400" /> : 
      <SortDesc size={16} className="text-blue-600 dark:text-blue-400" />;
  };

  const getSortLabel = () => {
    return sortOrder === 'asc' ? 'Oldest First' : 'Newest First';
  };

  const handleFilterSelect = (filterKey) => {
    onFilterTypeChange(filterKey);
    setShowDropdown(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setShowDropdown(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Sort Order Toggle */}
      <button
        onClick={onToggleSort}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
        title={`Sort by date: ${getSortLabel()}`}
      >
        {getSortIcon()}
      </button>

      {/* Date Range Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
            hasActiveFilters
              ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Filter size={16} />
          <ChevronDown 
            size={14} 
            className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Filter Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleFilterSelect(option.key)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                  filterType === option.key
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
                {filterType === option.key && (
                  <CheckCircle2 size={14} className="ml-auto" />
                )}
              </button>
            ))}
            
            {hasActiveFilters && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <button
                  onClick={handleClearFilters}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <X size={14} />
                  Clear Filters
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Filter Statistics */}
      {filterStats.isFiltered && (
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>
            {filterStats.filtered} of {filterStats.total} 
            <span className="hidden xl:inline"> items ({filterStats.percentage}%)</span>
          </span>
        </div>
      )}

      {/* Active Filters Indicator (Mobile) */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="lg:hidden p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
          title="Clear all filters"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default DateFilter; 