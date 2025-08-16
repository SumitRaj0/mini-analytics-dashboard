import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from 'recharts';
import { Calendar } from 'lucide-react';

const MonthlyPerformanceChart = ({ data = [], isLoading = false }) => {
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
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Monthly Performance Trend</h3>
        <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl mb-2">📅</div>
            <p className="text-sm">No monthly performance data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Group data by month and calculate monthly metrics
  const createMonthlyData = () => {
    const monthlyData = {};
    
    data.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          monthYear: monthKey,
          totalPnL: 0,
          dailyPnLs: [],
          cumulativePnL: item.cumulativePnL
        };
      }
      
      monthlyData[monthKey].dailyPnLs.push(item.dailyPnL);
      monthlyData[monthKey].totalPnL += item.dailyPnL;
      monthlyData[monthKey].cumulativePnL = item.cumulativePnL; // Keep the latest cumulative
    });

    return Object.values(monthlyData).map(month => ({
      ...month,
      avgDailyPnL: month.dailyPnLs.length > 0 ? month.totalPnL / month.dailyPnLs.length : 0,
      tradingDays: month.dailyPnLs.length,
      positiveCount: month.dailyPnLs.filter(pnl => pnl > 0).length,
      winRate: month.dailyPnLs.length > 0 ? (month.dailyPnLs.filter(pnl => pnl > 0).length / month.dailyPnLs.length) * 100 : 0
    }));
  };

  const monthlyData = createMonthlyData();
  const bestMonth = monthlyData.reduce((best, current) => 
    current.totalPnL > best.totalPnL ? current : best, monthlyData[0] || {});
  const worstMonth = monthlyData.reduce((worst, current) => 
    current.totalPnL < worst.totalPnL ? current : worst, monthlyData[0] || {});

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const monthData = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {monthData.month} Performance
          </p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-600">
              Total P&L: <span className={`font-medium ${monthData.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${monthData.totalPnL?.toFixed(0)}
              </span>
            </p>
            <p className="text-gray-600">
              Trading Days: <span className="font-medium">{monthData.tradingDays}</span>
            </p>
            <p className="text-gray-600">
              Win Rate: <span className="font-medium">{monthData.winRate?.toFixed(1)}%</span>
            </p>
            <p className="text-gray-600">
              Avg Daily: <span className={`font-medium ${monthData.avgDailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${monthData.avgDailyPnL?.toFixed(0)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value) => {
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-slate-700">Monthly Performance Trend</h3>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Calendar size={12} />
          {monthlyData.length} months
        </div>
      </div>

      {/* Monthly Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-sm font-semibold text-blue-700">
            {monthlyData.length}
          </div>
          <div className="text-xs text-blue-600">Months</div>
        </div>
        <div className={`rounded-lg p-2 text-center ${bestMonth.totalPnL >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-sm font-semibold ${bestMonth.totalPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            ${Math.round(bestMonth.totalPnL)}
          </div>
          <div className={`text-xs ${bestMonth.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>Best Month</div>
        </div>
        <div className={`rounded-lg p-2 text-center ${worstMonth.totalPnL >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-sm font-semibold ${worstMonth.totalPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            ${Math.round(worstMonth.totalPnL)}
          </div>
          <div className={`text-xs ${worstMonth.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>Worst Month</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="text-sm font-semibold text-gray-700">
            {monthlyData.filter(m => m.totalPnL > 0).length}
          </div>
          <div className="text-xs text-gray-600">Profitable</div>
        </div>
      </div>
      
      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
            <XAxis 
              dataKey="month"
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#475569' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              yAxisId="pnl"
              tickFormatter={formatYAxisTick}
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#475569' }}
              axisLine={{ stroke: '#e2e8f0' }}
              width={window.innerWidth < 640 ? 40 : 60}
            />
            <YAxis 
              yAxisId="winRate"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#475569' }}
              axisLine={{ stroke: '#e2e8f0' }}
              width={window.innerWidth < 640 ? 30 : 40}
            />
            <ReferenceLine yAxisId="pnl" y={0} stroke="#c7d2fe" strokeDasharray="2 2" />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              yAxisId="pnl"
              dataKey="totalPnL" 
              radius={[6, 6, 0, 0]}
            >
              {monthlyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.totalPnL >= 0 ? '#4f46e5' : '#ef4444'}
                />
              ))}
            </Bar>
            
            <Line
              yAxisId="winRate"
              type="monotone"
              dataKey="winRate"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 4, fill: '#8b5cf6' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-600 rounded"></div>
          <span className="text-gray-600">Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-violet-500"></div>
          <span className="text-gray-600">Win Rate %</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPerformanceChart;