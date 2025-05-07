const { getCandles } = require("../services/bybitService");
const { sendAlert } = require("../services/telegramService");

// Define zona de suporte/resistência
function getSupportResistanceZones(candles, range = 20) {
  const recent = candles.slice(-range);

  const highs = recent.map(c => c.high);
  const lows = recent.map(c => c.low);

  const resistance = Math.max(...highs);
  const support = Math.min(...lows);

  return { resistance, support };
}

// Verifica se está testando zona com margem
function isNear(value1, value2, tolerancePercent = 0.3) {
  const diff = Math.abs(value1 - value2);
  const maxDiff = value2 * (tolerancePercent / 100);
  return diff <= maxDiff;
}

async function detectPullback(symbol, interval = "60") {
  const candles = await getCandles(symbol, interval, 50);
  const lastCandle = candles[candles.length - 1];
  const close = lastCandle.close;

  const { resistance, support } = getSupportResistanceZones(candles);

  let message = null;

  if (isNear(close, resistance)) {
    message = `🟨 Pullback na resistência detectado em ${symbol} (${interval}min)\n• Preço: ${close.toFixed(2)}\n• Zona: ${resistance.toFixed(2)}`;
  } else if (isNear(close, support)) {
    message = `🟦 Pullback no suporte detectado em ${symbol} (${interval}min)\n• Preço: ${close.toFixed(2)}\n• Zona: ${support.toFixed(2)}`;
  }

  if (message) {
    //await sendAlert(`🚨 ${message}`);
    return {
      symbol,
      interval,
      message,
      timestamp: Date.now()
    };
  }

  return null;
}

module.exports = { detectPullback };
