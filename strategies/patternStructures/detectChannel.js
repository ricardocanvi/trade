// strategies/patternStructures/detectChannel.js

function detectChannel(candles) {
    const len = candles.length;
    if (len < 20) return null;
  
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
  
    const recentHighs = highs.slice(-10);
    const recentLows = lows.slice(-10);
  
    const highSlope = (recentHighs[9] - recentHighs[0]) / 10;
    const lowSlope = (recentLows[9] - recentLows[0]) / 10;
  
    const slopeDiff = Math.abs(highSlope - lowSlope);
    const averageSlope = (Math.abs(highSlope) + Math.abs(lowSlope)) / 2;
  
    // Linhas quase paralelas e ascendentes
    if (
      highSlope > 0 &&
      lowSlope > 0 &&
      slopeDiff / averageSlope < 0.2
    ) {
      return {
        name: "📈 Canal de Alta - tendência de alta organizada"
      };
    }
  
    // Linhas quase paralelas e descendentes
    if (
      highSlope < 0 &&
      lowSlope < 0 &&
      slopeDiff / averageSlope < 0.2
    ) {
      return {
        name: "📉 Canal de Baixa - tendência de baixa organizada"
      };
    }
  
    return null;
  }
  
  module.exports = detectChannel;
  