const { getCandles } = require("../services/bybitService");
const { sendAlert } = require("../services/telegramService");

// Cálculo de RSI (14 períodos)
function calculateRSI(closes, period = 14) {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rsi = [100 - 100 / (1 + avgGain / avgLoss)];

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }

    rsi.push(100 - 100 / (1 + avgGain / avgLoss));
  }

  return rsi;
}

function findDivergence(closes, rsis) {
  const len = closes.length;

  const prevClose = closes[len - 3];
  const lastClose = closes[len - 1];
  const prevRSI = rsis[rsis.length - 3];
  const lastRSI = rsis[rsis.length - 1];

  // Divergência de baixa: preço subiu, RSI caiu
  if (lastClose > prevClose && lastRSI < prevRSI) {
    return "📉 Divergência de Baixa (RSI caiu, preço subiu)";
  }

  // Divergência de alta: preço caiu, RSI subiu
  if (lastClose < prevClose && lastRSI > prevRSI) {
    return "📈 Divergência de Alta (RSI subiu, preço caiu)";
  }

  return null;
}

async function detectRSIDivergence(symbol, interval = "60") {
  const candles = await getCandles(symbol, interval, 100);
  const closes = candles.map(c => c.close);
  const rsis = calculateRSI(closes);

  const divergence = findDivergence(closes, rsis);

  if (divergence) {
    const rsiLevel = rsis[rsis.length - 1];
    const zone =
      rsiLevel > 70 ? "📈 Zona de Sobrecompra (>70)" :
      rsiLevel < 30 ? "📉 Zona de Sobrevenda (<30)" :
      null;
  
    const message = `🚨 Divergência RSI detectada em ${symbol} (${interval}min):\n- ${divergence}` +
                    (zone ? `\n- ${zone}` : "");
  
   // await sendAlert(message);
  
    return {
      symbol,
      interval,
      divergence,
      rsiLevel,
      zone,
      message,
      timestamp: Date.now()
    };
  }
  

  return null;
}

module.exports = { detectRSIDivergence };
