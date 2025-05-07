// strategies/patternStructures/detectWedge.js

function detectWedge(candles) {
    const len = candles.length;
    if (len < 20) return null;
  
    // Coleta topos e fundos recentes
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
  
    const recentHighs = highs.slice(-10);
    const recentLows = lows.slice(-10);
  
    const highSlope = (recentHighs[9] - recentHighs[0]) / 10;
    const lowSlope = (recentLows[9] - recentLows[0]) / 10;
  
    // Cunha de baixa: ambas as linhas descendentes e convergentes
    if (
      highSlope < 0 &&
      lowSlope < 0 &&
      Math.abs(highSlope - lowSlope) < Math.abs(highSlope) * 0.5
    ) {
      return {
        name: "📉 Cunha de Baixa (Falling Wedge) - possível reversão de alta"
      };
    }
  
    // Cunha de alta: ambas as linhas ascendentes e convergentes
    if (
      highSlope > 0 &&
      lowSlope > 0 &&
      Math.abs(highSlope - lowSlope) < Math.abs(highSlope) * 0.5
    ) {
      return {
        name: "📈 Cunha de Alta (Rising Wedge) - possível reversão de baixa"
      };
    }
  
    return null;
  }
  
  module.exports = detectWedge;
  