import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Clock, SortAsc, SortDesc } from 'lucide-react';
import { useDateFilter } from '../hooks/useDateFilter';

const RecentTrades = ({ trades = [], isLoading = false }) => {
  // Use date filter hook for sorting trades by exit date
  const {
    filteredData: filteredTrades,
    sortOrder,
    toggleSortOrder
  } = useDateFilter(trades, 'exitDate');

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-16 flex-shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded w-20 flex-shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded w-24 flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-16 flex-shrink-0"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Trades</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-sm">No recent trades available</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getTypeIcon = (type) => {
    return type === 'long' ? (
      <TrendingUp size={16} className="text-success-600" />
    ) : (
      <TrendingDown size={16} className="text-danger-600" />
    );
  };

  const getPnLDisplay = (pnl, percentage) => {
    const isProfit = pnl > 0;
    const colorClass = isProfit ? 'text-success-600' : 'text-danger-600';
    
    return (
      <div className={`font-medium ${colorClass}`}>
        <div className="text-sm sm:text-base">${Math.abs(pnl)?.toLocaleString()}</div>
        <div className="text-xs opacity-75">
          {isProfit ? '+' : '-'}{Math.abs(percentage)?.toFixed(2)}%
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Trades</h3>
        <span className="text-sm text-gray-500">
          {filteredTrades.length} trades
        </span>
      </div>

      {/* Trade List */}
      <>
        {/* Mobile Card Layout for small screens */}
        <div className="block sm:hidden space-y-3">
          {filteredTrades.map((trade, index) => {
            const dateTime = formatDate(trade.exitDate);
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900 text-base sm:text-lg">{trade.symbol}</span>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(trade.type)}
                      <span className="text-sm capitalize text-gray-600">{trade.type}</span>
                    </div>
                  </div>
                  {getPnLDisplay(trade.pnl, trade.pnlPercentage)}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="text-gray-500">Entry:</span> ${trade.entryPrice}
                  </div>
                  <div>
                    <span className="text-gray-500">Exit:</span> ${trade.exitPrice}
                  </div>
                  <div>
                    <span className="text-gray-500">Qty:</span> {trade.quantity}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    {dateTime.date}
                  </div>
                </div>
                
                {trade.tags && trade.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {trade.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-block px-2 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      {/* Desktop Table Layout for larger screens */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-3 sm:px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="text-left py-4 px-3 sm:px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left py-4 px-3 sm:px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Entry/Exit
                  </th>
                  <th className="text-left py-4 px-3 sm:px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="text-left py-4 px-3 sm:px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="text-left py-4 px-3 sm:px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={toggleSortOrder}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      title={`Sort by date: ${sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}`}
                    >
                      Date
                      {sortOrder === 'asc' ? (
                        <SortAsc size={12} className="text-blue-600" />
                      ) : (
                        <SortDesc size={12} className="text-blue-600" />
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredTrades.map((trade, index) => {
                  const dateTime = formatDate(trade.exitDate);
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-3 sm:px-6">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 text-base">{trade.symbol}</span>
                          {trade.tags && trade.tags.length > 0 && (
                            <div className="ml-3 hidden lg:flex gap-2">
                              {trade.tags.slice(0, 2).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="inline-block px-2 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-6">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(trade.type)}
                          <span className="text-sm capitalize">{trade.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-6">
                        <div className="text-sm">
                          <div className="text-gray-600">
                            ${trade.entryPrice} → ${trade.exitPrice}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-6">
                        <span className="text-sm text-gray-600">{trade.quantity}</span>
                      </td>
                      <td className="py-4 px-3 sm:px-6">
                        {getPnLDisplay(trade.pnl, trade.pnlPercentage)}
                      </td>
                      <td className="py-4 px-3 sm:px-6">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar size={16} />
                            {dateTime.date}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock size={14} />
                            {dateTime.time}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>
    </div>
  );
};

export default RecentTrades; 