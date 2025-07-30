require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Mock data generator
const generateMockAnalytics = () => {
  // Generate random but realistic trading metrics
  const totalTrades = Math.floor(Math.random() * 200) + 100; // 100-300 trades
  const winningTrades = Math.floor(totalTrades * (0.45 + Math.random() * 0.2)); // 45-65% win rate
  const losingTrades = totalTrades - winningTrades;
  const winRate = (winningTrades / totalTrades) * 100;
  
  const avgWinAmount = 150 + Math.random() * 200; // $150-350 avg win
  const avgLossAmount = 80 + Math.random() * 120; // $80-200 avg loss
  
  const grossProfit = winningTrades * avgWinAmount;
  const grossLoss = losingTrades * avgLossAmount;
  const netProfit = grossProfit - grossLoss;
  const profitFactor = grossProfit / grossLoss;
  
  const averageReturn = (netProfit / totalTrades / 1000) * 100; // Assuming $1000 per trade base
  const maxDrawdown = -(5 + Math.random() * 15); // -5% to -20%
  const sharpeRatio = 0.8 + Math.random() * 1.4; // 0.8 to 2.2
  
  // Generate streak data
  const longestWinStreak = Math.floor(Math.random() * 8) + 3; // 3-10
  const longestLossStreak = Math.floor(Math.random() * 6) + 2; // 2-7

  return {
    winRate: parseFloat(winRate.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    averageReturn: parseFloat(averageReturn.toFixed(2)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    totalTrades,
    winningTrades,
    losingTrades,
    longestWinStreak,
    longestLossStreak,
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    netProfit: parseFloat(netProfit.toFixed(2)),
    netProfitPercentage: parseFloat(((netProfit / (totalTrades * 1000)) * 100).toFixed(2)),
    grossProfit: parseFloat(grossProfit.toFixed(2)),
    grossLoss: parseFloat(grossLoss.toFixed(2))
  };
};

const generateMockTrades = () => {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 'AMD', 'CRM'];
  const trades = [];
  
  for (let i = 0; i < 10; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = Math.random() > 0.5 ? 'long' : 'short';
    const entryPrice = 50 + Math.random() * 300;
    const priceChange = (Math.random() - 0.5) * 0.1; // -5% to +5% change
    const exitPrice = entryPrice * (1 + priceChange);
    const quantity = Math.floor(Math.random() * 100) + 10;
    
    let pnl, pnlPercentage;
    if (type === 'long') {
      pnl = (exitPrice - entryPrice) * quantity;
      pnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;
    } else {
      pnl = (entryPrice - exitPrice) * quantity;
      pnlPercentage = ((entryPrice - exitPrice) / entryPrice) * 100;
    }
    
    const entryDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const exitDate = new Date(entryDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Hold for up to 7 days
    
    trades.push({
      symbol,
      type,
      entryPrice: parseFloat(entryPrice.toFixed(2)),
      exitPrice: parseFloat(exitPrice.toFixed(2)),
      quantity,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercentage: parseFloat(pnlPercentage.toFixed(2)),
      entryDate: entryDate.toISOString(),
      exitDate: exitDate.toISOString(),
      tags: Math.random() > 0.7 ? ['momentum'] : []
    });
  }
  
  return trades.sort((a, b) => new Date(b.exitDate) - new Date(a.exitDate));
};

const generateMockChartData = () => {
  const data = [];
  let cumulativePnL = 0;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    const dailyPnL = (Math.random() - 0.4) * 200; // Slight positive bias
    cumulativePnL += dailyPnL;
    
    data.push({
      date: date.toISOString().split('T')[0],
      cumulativePnL: parseFloat(cumulativePnL.toFixed(2)),
      dailyPnL: parseFloat(dailyPnL.toFixed(2))
    });
  }
  
  return data;
};

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Analytics Dashboard API is running' 
  });
});

// Single analytics endpoint as required
app.get('/api/analytics', (req, res) => {
  try {
    const analytics = generateMockAnalytics();
    const recentTrades = generateMockTrades();
    
    res.json({
      success: true,
      data: {
        ...analytics,
        recentTrades
      }
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

// Additional endpoint for chart data (used by frontend)
app.get('/api/analytics/performance-chart', (req, res) => {
  try {
    const chartData = generateMockChartData();
    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error generating chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Analytics API available at http://localhost:${PORT}/api/analytics`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
}); 