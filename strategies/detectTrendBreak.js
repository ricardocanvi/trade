function isFundo(index, lows) {
    return index > 0 && index < lows.length - 1 &&
           lows[index] < lows[index - 1] && lows[index] < lows[index + 1];
  }
  
  function isTopo(index, highs) {
    return index > 0 && index < highs.length - 1 &&
           highs[index] > highs[index - 1] && highs[index] > highs[index + 1];
  }
  
  function linearRegression(points) {
    const n = points.length;
    const sumX = points.reduce((acc, p) => acc + p[0], 0);
    const sumY = points.reduce((acc, p) => acc + p[1], 0);
    const sumXY = points.reduce((acc, p) => acc + p[0] * p[1], 0);
    const sumX2 = points.reduce((acc, p) => acc + p[0] * p[0], 0);
  
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;
  
    return { m, b };
  }
  
  function detectTrendBreak(candles) {
    if (!candles || candles.length < 20) return null;
  
    const lows = candles.map(c => c.low);
    const highs = candles.map(c => c.high);
    const fundos = [];
    const topos = [];
  
    for (let i = 1; i < lows.length - 1; i++) {
      if (isFundo(i, lows)) fundos.push([i, lows[i]]);
      if (isTopo(i, highs)) topos.push([i, highs[i]]);
    }
  
    const result = [];
  
    // LTA
    if (fundos.length >= 3) {
      const ultimosFundos = fundos.slice(-3);
      const { m, b } = linearRegression(ultimosFundos);
      const expectedLow = m * (candles.length - 1) + b;
      const close = candles.at(-1).close;
  
      if (close < expectedLow) {
        result.push({ name: "📉 Rompimento de LTA detectado (fechamento abaixo da linha de tendência de alta)" });
      }
    }
  
    // LTB
    if (topos.length >= 3) {
      const ultimosTopos = topos.slice(-3);
      const { m, b } = linearRegression(ultimosTopos);
      const expectedHigh = m * (candles.length - 1) + b;
      const close = candles.at(-1).close;
  
      if (close > expectedHigh) {
        result.push({ name: "📈 Rompimento de LTB detectado (fechamento acima da linha de tendência de baixa)" });
      }
    }
  
    return result.length > 0 ? { messages: result } : null;
  }
  
  module.exports = { detectTrendBreak };
  