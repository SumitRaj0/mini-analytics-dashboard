import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DollarSign } from 'lucide-react';

const ProfitDistributionChart = ({ trades = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 sm:h-6 bg-gray-200 rounded w-32 sm:w-40 mb-4"></div>
          <div className="h-48 sm:h-56 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <div className="card">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Profit Distribution</h3>
        <div className="h-48 sm:h-56 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl mb-2">📊</div>
            <p className="text-sm">No profit distribution data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Create profit distribution buckets
  const createProfitBuckets = () => {
    const profits = trades.map(trade => trade.pnl).sort((a, b) => a - b);
    const minProfit = Math.min(...profits);
    const maxProfit = Math.max(...profits);
    
    // Create 8 buckets for better visualization
    const bucketCount = 8;
    const bucketSize = (maxProfit - minProfit) / bucketCount;
    
    const buckets = [];
    for (let i = 0; i < bucketCount; i++) {
      const start = minProfit + (i * bucketSize);
      const end = start + bucketSize;
      const count = profits.filter(p => p >= start && (i === bucketCount - 1 ? p <= end : p < end)).length;
      
      buckets.push({
        range: `${start >= 0 ? '+' : ''}${Math.round(start)}`,
        rangeEnd: `${end >= 0 ? '+' : ''}${Math.round(end)}`,
        count: count,
        midPoint: (start + end) / 2,
        isProfit: (start + end) / 2 > 0
      });
    }
    
    return buckets;
  };

  const bucketData = createProfitBuckets();
  const totalTrades = trades.length;
  const profitableTrades = trades.filter(t => t.pnl > 0).length;
  const avgProfit = trades.reduce((sum, t) => sum + t.pnl, 0) / trades.length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.count / totalTrades) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Range: ${data.range} to ${data.rangeEnd}
          </p>
          <p className="text-sm text-gray-600">
            Trades: <span className="font-medium">{data.count}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Profit Distribution</h3>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <DollarSign size={12} />
          {trades.length} trades
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="text-sm font-semibold text-gray-900">
            ${Math.round(avgProfit)}
          </div>
          <div className="text-xs text-gray-600">Avg P&L</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-sm font-semibold text-green-700">
            {profitableTrades}
          </div>
          <div className="text-xs text-green-600">Profitable</div>
        </div>
        <div className="bg-red-50 rounded-lg p-2 text-center">
          <div className="text-sm font-semibold text-red-700">
            {totalTrades - profitableTrades}
          </div>
          <div className="text-xs text-red-600">Losing</div>
        </div>
      </div>
      
      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bucketData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="range"
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              width={window.innerWidth < 640 ? 30 : 40}
            />
            <ReferenceLine x={0} stroke="#64748b" strokeDasharray="2 2" />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill={(entry) => entry.isProfit ? '#22c55e' : '#ef4444'}
              radius={[2, 2, 0, 0]}
            >
              {bucketData.map((entry, index) => (
                <Bar 
                  key={`bar-${index}`}
                  fill={entry.isProfit ? '#22c55e' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Insights */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Losses</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Break Even</span>
          <div className="w-8 h-0.5 bg-gray-400"></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Profits</span>
          <div className="w-3 h-3 bg-green-500 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfitDistributionChart;