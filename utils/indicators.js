function calculateEMA(data, period) {
    let k = 2 / (period + 1);
    let emaArray = [data[0]];
  
    for (let i = 1; i < data.length; i++) {
      emaArray.push(data[i] * k + emaArray[i - 1] * (1 - k));
    }
  
    return emaArray;
  }
  
  function calculateStochastic(data, period = 8) {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      let slice = data.slice(i - period + 1, i + 1);
      let high = Math.max(...slice.map(d => d.high));
      let low = Math.min(...slice.map(d => d.low));
      let close = data[i].close;
      let k = ((close - low) / (high - low)) * 100;
      result.push(k);
    }
    return result;
  }
  
  module.exports = { calculateEMA, calculateStochastic };
  