// strategies/patternStructures/detectFlag.js

function detectFlag(candles) {
    const len = candles.length;
    if (len < 30) return null;
  
    const closes = candles.map(c => c.close);
  
    // Etapa 1: verifica se houve uma "haste" (movimento forte)
    const impulseStart = closes.slice(-30, -20)[0];
    const impulseEnd = closes.slice(-20, -10)[closes.slice(-20, -10).length - 1];
    const impulseChange = (impulseEnd - impulseStart) / impulseStart;
  
    if (Math.abs(impulseChange) < 0.05) return null; // rejeita se movimento for fraco
  
    const recentHighs = candles.slice(-10).map(c => c.high);
    const recentLows = candles.slice(-10).map(c => c.low);
  
    const highSlope = (recentHighs[9] - recentHighs[0]) / 10;
    const lowSlope = (recentLows[9] - recentLows[0]) / 10;
  
    const sameSlope = Math.sign(highSlope) === Math.sign(lowSlope);
    const flagAgainstTrend = (impulseChange > 0 && highSlope < 0) || (impulseChange < 0 && highSlope > 0);
  
    if (sameSlope && flagAgainstTrend) {
      return {
        name: impulseChange > 0
          ? "🚩 Bandeira de Alta - possível continuação de alta"
          : "🏴 Bandeira de Baixa - possível continuação de baixa"
      };
    }
  
    return null;
  }
  
  module.exports = detectFlag;
  