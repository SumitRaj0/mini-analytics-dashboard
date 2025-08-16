import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, Activity, Target } from 'lucide-react';

const AssetAllocationChart = ({ trades = [], isLoading = false }) => {
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
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Asset Allocation</h3>
        <div className="h-48 sm:h-56 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl mb-2">🥧</div>
            <p className="text-sm">No asset allocation data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Create asset allocation data
  const createAssetData = () => {
    const assetMap = {};
    let totalVolume = 0;
    
    trades.forEach(trade => {
      const volume = Math.abs(trade.pnl);
      if (!assetMap[trade.symbol]) {
        assetMap[trade.symbol] = {
          symbol: trade.symbol,
          trades: 0,
          totalPnL: 0,
          volume: 0,
          winningTrades: 0,
          losingTrades: 0
        };
      }
      
      assetMap[trade.symbol].trades += 1;
      assetMap[trade.symbol].totalPnL += trade.pnl;
      assetMap[trade.symbol].volume += volume;
      totalVolume += volume;
      
      if (trade.pnl > 0) {
        assetMap[trade.symbol].winningTrades += 1;
      } else {
        assetMap[trade.symbol].losingTrades += 1;
      }
    });

    // Convert to array and calculate percentages
    const assets = Object.values(assetMap).map(asset => ({
      ...asset,
      percentage: (asset.volume / totalVolume) * 100,
      winRate: asset.trades > 0 ? (asset.winningTrades / asset.trades) * 100 : 0
    }));

    // Sort by volume and take top 8, group others
    assets.sort((a, b) => b.volume - a.volume);
    const topAssets = assets.slice(0, 7);
    const otherAssets = assets.slice(7);
    
    if (otherAssets.length > 0) {
      const othersTotal = otherAssets.reduce((sum, asset) => ({
        trades: sum.trades + asset.trades,
        totalPnL: sum.totalPnL + asset.totalPnL,
        volume: sum.volume + asset.volume,
        winningTrades: sum.winningTrades + asset.winningTrades,
        losingTrades: sum.losingTrades + asset.losingTrades
      }), { trades: 0, totalPnL: 0, volume: 0, winningTrades: 0, losingTrades: 0 });
      
      topAssets.push({
        symbol: 'Others',
        ...othersTotal,
        percentage: (othersTotal.volume / totalVolume) * 100,
        winRate: othersTotal.trades > 0 ? (othersTotal.winningTrades / othersTotal.trades) * 100 : 0
      });
    }

    return topAssets;
  };

  const assetData = createAssetData();
  
  // Professional color palette
  const colors = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {data.symbol}
          </p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-600">
              Trades: <span className="font-medium">{data.trades}</span>
            </p>
            <p className="text-gray-600">
              Allocation: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </p>
            <p className="text-gray-600">
              Total P&L: <span className={`font-medium ${data.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${data.totalPnL.toFixed(0)}
              </span>
            </p>
            <p className="text-gray-600">
              Win Rate: <span className="font-medium">{data.winRate.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, symbol }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if percentage is significant enough
    const percentage = (value / trades.length) * 100;
    if (percentage < 5) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={window.innerWidth < 640 ? 10 : 12}
        fontWeight="600"
      >
        {symbol}
      </text>
    );
  };

  const topPerformer = assetData.reduce((best, current) => 
    current.totalPnL > best.totalPnL ? current : best, assetData[0] || {});
  const worstPerformer = assetData.reduce((worst, current) => 
    current.totalPnL < worst.totalPnL ? current : worst, assetData[0] || {});

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Asset Allocation</h3>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <PieChartIcon size={12} />
          {assetData.length} assets
        </div>
      </div>

      {/* Top Performers Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`rounded-lg p-2 text-center ${topPerformer.totalPnL >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target size={12} className={topPerformer.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'} />
            <div className={`text-sm font-semibold ${topPerformer.totalPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {topPerformer.symbol}
            </div>
          </div>
          <div className={`text-xs ${topPerformer.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Best: ${Math.round(topPerformer.totalPnL)}
          </div>
        </div>
        <div className={`rounded-lg p-2 text-center ${worstPerformer.totalPnL >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Activity size={12} className={worstPerformer.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'} />
            <div className={`text-sm font-semibold ${worstPerformer.totalPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {worstPerformer.symbol}
            </div>
          </div>
          <div className={`text-xs ${worstPerformer.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Worst: ${Math.round(worstPerformer.totalPnL)}
          </div>
        </div>
      </div>
      
      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={assetData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={<CustomLabel />}
              outerRadius={window.innerWidth < 640 ? 70 : 90}
              fill="#8884d8"
              dataKey="trades"
              paddingAngle={1}
            >
              {assetData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  stroke={colors[index % colors.length]}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Asset List */}
      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto scroll-thin">
        {assetData.map((asset, index) => (
          <div key={asset.symbol} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="font-medium text-gray-900">{asset.symbol}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <span>{asset.trades} trades</span>
              <span>{asset.percentage.toFixed(1)}%</span>
              <span className={asset.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                ${Math.round(asset.totalPnL)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetAllocationChart;