// Export utilities for PDF and CSV generation

// CSV Export functionality
export const exportToCSV = (data, filename = 'analytics-data.csv') => {
  try {
    let csvContent = '';
    
    if (data.analytics) {
      // Export analytics metrics
      csvContent += 'Analytics Metrics\n';
      csvContent += 'Metric,Value,Unit\n';
      csvContent += `Win Rate,${data.analytics.winRate},%\n`;
      csvContent += `Profit Factor,${data.analytics.profitFactor},ratio\n`;
      csvContent += `Average Return,${data.analytics.averageReturn},%\n`;
      csvContent += `Maximum Drawdown,${data.analytics.maxDrawdown},%\n`;
      csvContent += `Total Trades,${data.analytics.totalTrades},count\n`;
      csvContent += `Winning Trades,${data.analytics.winningTrades},count\n`;
      csvContent += `Losing Trades,${data.analytics.losingTrades},count\n`;
      csvContent += `Longest Win Streak,${data.analytics.longestWinStreak},count\n`;
      csvContent += `Longest Loss Streak,${data.analytics.longestLossStreak},count\n`;
      csvContent += `Sharpe Ratio,${data.analytics.sharpeRatio},ratio\n`;
      csvContent += `Net Profit,${data.analytics.netProfit},$\n`;
      csvContent += '\n';
    }
    
    if (data.recentTrades) {
      // Export recent trades
      csvContent += 'Recent Trades\n';
      csvContent += 'Symbol,Type,Entry Price,Exit Price,Quantity,P&L,P&L %,Entry Date,Exit Date\n';
      
      data.recentTrades.forEach(trade => {
        const entryDate = new Date(trade.entryDate).toLocaleDateString();
        const exitDate = new Date(trade.exitDate).toLocaleDateString();
        csvContent += `${trade.symbol},${trade.type},${trade.entryPrice},${trade.exitPrice},${trade.quantity},${trade.pnl},${trade.pnlPercentage},${entryDate},${exitDate}\n`;
      });
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return false;
  }
};

// PDF Export functionality (using browser's print)
export const exportToPDF = () => {
  try {
    // Store current title
    const originalTitle = document.title;
    
    // Set PDF-friendly title
    document.title = `Trading Analytics Report - ${new Date().toLocaleDateString()}`;
    
    // Add print styles temporarily
    const printStyles = `
      @media print {
        .no-print { display: none !important; }
        .print-break { page-break-before: always; }
        body { -webkit-print-color-adjust: exact; color-adjust: exact; }
        .card { break-inside: avoid; margin-bottom: 1rem; }
        .chart-container { height: 300px !important; }
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = printStyles;
    document.head.appendChild(styleElement);
    
    // Trigger print dialog
    window.print();
    
    // Clean up
    setTimeout(() => {
      document.head.removeChild(styleElement);
      document.title = originalTitle;
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return false;
  }
};

// Generate shareable snapshot URL
export const generateShareableSnapshot = (data) => {
  try {
    const snapshot = {
      timestamp: new Date().toISOString(),
      winRate: data.analytics?.winRate,
      profitFactor: data.analytics?.profitFactor,
      netProfit: data.analytics?.netProfit,
      totalTrades: data.analytics?.totalTrades,
      sharpeRatio: data.analytics?.sharpeRatio
    };
    
    // Encode snapshot data
    const encodedData = btoa(JSON.stringify(snapshot));
    const shareUrl = `${window.location.origin}${window.location.pathname}?snapshot=${encodedData}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      return shareUrl;
    }).catch(err => {
      console.error('Could not copy to clipboard:', err);
      return shareUrl;
    });
    
    return shareUrl;
  } catch (error) {
    console.error('Error generating shareable snapshot:', error);
    return null;
  }
};

// Export current chart as image
export const exportChartAsImage = (chartId, filename = 'chart.png') => {
  try {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      throw new Error('Chart element not found');
    }
    
    // Note: This would require a library like html2canvas for full implementation
    // For now, we'll provide a placeholder that shows the concept
    console.log('Chart export feature would be implemented with html2canvas library');
    return true;
  } catch (error) {
    console.error('Error exporting chart:', error);
    return false;
  }
};

// Format data for different export types
export const formatDataForExport = (analytics, chartData, trades) => {
  return {
    analytics: {
      ...analytics,
      exportDate: new Date().toISOString(),
      exportType: 'full-analytics'
    },
    chartData: chartData?.map(item => ({
      date: item.date,
      cumulativePnL: item.cumulativePnL,
      dailyPnL: item.dailyPnL
    })) || [],
    recentTrades: trades || []
  };
}; 