const { getCandles } = require("../services/bybitService");
const { sendAlert } = require("../services/telegramService");

function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

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

function calculateMACD(closes) {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macd = [];

  for (let i = 0; i < ema26.length; i++) {
    macd.push(ema12[i + (26 - 12)] - ema26[i]);
  }

  return macd;
}

function detectDivergence(prevPrice, lastPrice, prevValue, lastValue) {
  if (lastPrice > prevPrice && lastValue < prevValue) {
    return "baixa";
  }
  if (lastPrice < prevPrice && lastValue > prevValue) {
    return "alta";
  }
  return null;
}

async function detectRSIMACDDivergence(symbol, interval = "60") {
  const candles = await getCandles(symbol, interval, 100);
  const closes = candles.map(c => c.close);

  const rsis = calculateRSI(closes);
  const macds = calculateMACD(closes.slice(-50)); // Alinha com EMA26

  const pricePrev = closes[closes.length - 3];
  const priceLast = closes[closes.length - 1];

  const rsiPrev = rsis[rsis.length - 3];
  const rsiLast = rsis[rsis.length - 1];

  const macdPrev = macds[macds.length - 3];
  const macdLast = macds[macds.length - 1];

  const rsiDiv = detectDivergence(pricePrev, priceLast, rsiPrev, rsiLast);
  const macdDiv = detectDivergence(pricePrev, priceLast, macdPrev, macdLast);

  if (rsiDiv && macdDiv && rsiDiv === macdDiv) {
    const rsiLevel = rsis[rsis.length - 1];
    const zone =
      rsiLevel > 70 ? "📈 Zona de Sobrecompra (>70)" :
      rsiLevel < 30 ? "📉 Zona de Sobrevenda (<30)" :
      null;
  
    const type = rsiDiv === "alta" ? "📈 ALTA" : "📉 BAIXA";
    const msg = `🚨 Divergência COMBINADA RSI + MACD em ${symbol} (${interval}min):\n- Tipo: ${type}` +
                (zone ? `\n- ${zone}` : "");
  
   // await sendAlert(msg);
  
    return {
      symbol,
      interval,
      type,
      rsiLevel,
      zone,
      message: msg,
      timestamp: Date.now()
    };
  }
  

  return null;
}

module.exports = { detectRSIMACDDivergence };
