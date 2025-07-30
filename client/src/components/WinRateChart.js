import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const WinRateChart = ({ data, isLoading = false }) => {
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

  if (!data || !data.winningTrades) {
    return (
      <div className="card">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Win/Loss Distribution</h3>
        <div className="h-48 sm:h-56 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl mb-2">🎯</div>
            <p className="text-sm">No win rate data available</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Winning Trades',
      value: data.winningTrades,
      percentage: data.winRate,
      color: '#22c55e'
    },
    {
      name: 'Losing Trades',
      value: data.losingTrades,
      percentage: 100 - data.winRate,
      color: '#ef4444'
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {data.name}
          </p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex justify-center mt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-gray-700">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Win/Loss Distribution</h3>
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
          data.winRate >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {data.winRate >= 50 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {data.winRate.toFixed(1)}%
        </div>
      </div>
      
      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={window.innerWidth < 640 ? 30 : 40}
              outerRadius={window.innerWidth < 640 ? 60 : 80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={entry.color}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-bold text-green-700">{data.winningTrades}</div>
          <div className="text-xs text-green-600">Wins</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-lg font-bold text-red-700">{data.losingTrades}</div>
          <div className="text-xs text-red-600">Losses</div>
        </div>
      </div>
    </div>
  );
};

export default WinRateChart; 