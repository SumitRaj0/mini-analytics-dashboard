import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for date filtering with sorting functionality
 * @param {Array} data - Array of data to filter
 * @param {string} dateField - Field name containing the date
 * @returns {Object} Filter state and handlers
 */
export const useDateFilter = (data = [], dateField = 'date') => {
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });
  const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'

  /**
   * Toggle sort order between ascending and descending
   */
  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  /**
   * Set specific sort order
   * @param {string} order - 'asc' or 'desc'
   */
  const setSortOrderDirect = useCallback((order) => {
    if (order === 'asc' || order === 'desc') {
      setSortOrder(order);
    }
  }, []);

  /**
   * Set date range filter
   * @param {Date|string} start - Start date
   * @param {Date|string} end - End date
   */
  const setDateRangeFilter = useCallback((start, end) => {
    setDateRange({
      start: start ? new Date(start) : null,
      end: end ? new Date(end) : null
    });
    setFilterType('custom');
  }, []);

  /**
   * Set predefined filter type
   * @param {string} type - Filter type
   */
  const setFilterTypeDirect = useCallback((type) => {
    setFilterType(type);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (type) {
      case 'today':
        setDateRange({
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        });
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        setDateRange({ start: weekStart, end: weekEnd });
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        setDateRange({ start: monthStart, end: monthEnd });
        break;
      case 'all':
      default:
        setDateRange({ start: null, end: null });
        break;
    }
  }, []);

  /**
   * Extract date from object based on dateField
   * @param {Object} item - Data item
   * @returns {Date} Extracted date
   */
  const extractDate = useCallback((item) => {
    let dateValue = item[dateField];
    
    // Handle nested date fields (e.g., 'trade.exitDate')
    if (dateField.includes('.')) {
      const fields = dateField.split('.');
      dateValue = fields.reduce((obj, field) => obj?.[field], item);
    }
    
    return new Date(dateValue);
  }, [dateField]);

  /**
   * Check if date is within range
   * @param {Date} date - Date to check
   * @returns {boolean} Whether date is in range
   */
  const isDateInRange = useCallback((date) => {
    if (!dateRange.start && !dateRange.end) return true;
    
    const dateToCheck = new Date(date);
    
    if (dateRange.start && dateToCheck < dateRange.start) return false;
    if (dateRange.end && dateToCheck > dateRange.end) return false;
    
    return true;
  }, [dateRange]);

  /**
   * Filtered and sorted data
   */
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    // First filter by date range
    let filtered = data.filter(item => {
      try {
        const itemDate = extractDate(item);
        return !isNaN(itemDate.getTime()) && isDateInRange(itemDate);
      } catch (error) {
        console.warn('Error extracting date from item:', item, error);
        return false;
      }
    });

    // Then sort by date
    filtered.sort((a, b) => {
      try {
        const dateA = extractDate(a);
        const dateB = extractDate(b);
        
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0;
        }
        
        const comparison = dateA.getTime() - dateB.getTime();
        return sortOrder === 'asc' ? comparison : -comparison;
      } catch (error) {
        console.warn('Error sorting dates:', error);
        return 0;
      }
    });

    return filtered;
  }, [data, sortOrder, extractDate, isDateInRange]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setDateRange({ start: null, end: null });
    setFilterType('all');
    setSortOrder('desc');
  }, []);

  /**
   * Get filter statistics
   */
  const filterStats = useMemo(() => {
    const total = data?.length || 0;
    const filtered = filteredData.length;
    const percentage = total > 0 ? Math.round((filtered / total) * 100) : 0;
    
    return {
      total,
      filtered,
      percentage,
      isFiltered: filtered < total
    };
  }, [data, filteredData]);

  /**
   * Get date range display text
   */
  const dateRangeText = useMemo(() => {
    if (filterType === 'all') return 'All time';
    if (filterType === 'today') return 'Today';
    if (filterType === 'week') return 'This week';
    if (filterType === 'month') return 'This month';
    
    if (dateRange.start && dateRange.end) {
      const start = dateRange.start.toLocaleDateString();
      const end = dateRange.end.toLocaleDateString();
      return `${start} - ${end}`;
    }
    
    if (dateRange.start) {
      return `From ${dateRange.start.toLocaleDateString()}`;
    }
    
    if (dateRange.end) {
      return `Until ${dateRange.end.toLocaleDateString()}`;
    }
    
    return 'Custom range';
  }, [dateRange, filterType]);

  return {
    // State
    sortOrder,
    dateRange,
    filterType,
    filteredData,
    
    // Actions
    toggleSortOrder,
    setSortOrderDirect,
    setDateRangeFilter,
    setFilterTypeDirect,
    clearFilters,
    
    // Utilities
    filterStats,
    dateRangeText,
    isAscending: sortOrder === 'asc',
    isDescending: sortOrder === 'desc',
    hasActiveFilters: filterType !== 'all' || dateRange.start || dateRange.end
  };
};