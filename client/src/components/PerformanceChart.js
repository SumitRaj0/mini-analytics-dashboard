import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const PerformanceChart = ({ data = [], isLoading = false, type = 'line' }) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 mb-4"></div>
          <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Cumulative P&L Performance</h3>
        <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl mb-2">📈</div>
            <p className="text-sm">No performance data available</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 sm:p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
            Date: {new Date(label).toLocaleDateString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mb-1">
            Daily P&L: 
            <span className={`ml-1 font-medium ${data.dailyPnL >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              ${Math.abs(data.dailyPnL) >= 1000 ? 
                `${(Math.abs(data.dailyPnL) / 1000).toFixed(1)}K` : 
                Math.abs(data.dailyPnL)?.toLocaleString()}
              {data.dailyPnL < 0 ? ' loss' : ''}
            </span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            Cumulative: 
            <span className={`ml-1 font-medium ${data.cumulativePnL >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              ${Math.abs(data.cumulativePnL) >= 1000 ? 
                `${(Math.abs(data.cumulativePnL) / 1000).toFixed(1)}K` : 
                Math.abs(data.cumulativePnL)?.toLocaleString()}
              {data.cumulativePnL < 0 ? ' loss' : ''}
            </span>
          </p>
          {data.symbol && (
            <p className="text-xs text-gray-500 mt-1">Symbol: {data.symbol}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const formatXAxisTick = (value) => {
    const date = new Date(value);
    // Shorter format for mobile
    return window.innerWidth < 640 ? 
      date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) :
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatYAxisTick = (value) => {
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return window.innerWidth < 640 ? `$${value.toFixed(0)}` : `$${value}`;
  };

  const getLineColor = () => {
    const lastValue = data[data.length - 1]?.cumulativePnL || 0;
    return lastValue >= 0 ? '#22c55e' : '#ef4444';
  };

  const getGradientId = () => {
    const lastValue = data[data.length - 1]?.cumulativePnL || 0;
    return lastValue >= 0 ? 'colorGreen' : 'colorRed';
  };

  // Responsive margins for better scaling at 100% zoom
  const chartMargins = {
    top: 10,
    right: window.innerWidth < 640 ? 15 : 35,
    left: window.innerWidth < 640 ? 15 : 25,
    bottom: 10
  };

  if (type === 'area') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
          <div className="text-sm text-gray-500">
            {data.length} points
          </div>
        </div>
        
        <div className="h-64 sm:h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={chartMargins}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisTick}
                tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={formatYAxisTick}
                tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                width={window.innerWidth < 640 ? 40 : 60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativePnL"
                stroke={getLineColor()}
                fillOpacity={1}
                fill={`url(#${getGradientId()})`}
                strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
        <div className="text-sm text-gray-500">
          {data.length} points
        </div>
      </div>
      
      <div className="h-64 sm:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisTick}
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tickFormatter={formatYAxisTick}
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              width={window.innerWidth < 640 ? 40 : 60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="cumulativePnL"
              stroke={getLineColor()}
              strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
              dot={{ fill: getLineColor(), strokeWidth: 0, r: window.innerWidth < 640 ? 2 : 3 }}
              activeDot={{ r: window.innerWidth < 640 ? 4 : 5, fill: getLineColor() }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart; 