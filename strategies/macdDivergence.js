const { getCandles } = require("../services/bybitService");
const { sendAlert } = require("../services/telegramService");

// Reutiliza EMA
function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
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

function findMACDDivergence(closes, macds) {
  const len = closes.length;

  const prevClose = closes[len - 3];
  const lastClose = closes[len - 1];
  const prevMACD = macds[macds.length - 3];
  const lastMACD = macds[macds.length - 1];

  // Divergência de baixa: preço subiu, MACD caiu
  if (lastClose > prevClose && lastMACD < prevMACD) {
    return "📉 Divergência de Baixa (MACD caiu, preço subiu)";
  }

  // Divergência de alta: preço caiu, MACD subiu
  if (lastClose < prevClose && lastMACD > prevMACD) {
    return "📈 Divergência de Alta (MACD subiu, preço caiu)";
  }

  return null;
}

async function detectMACDDivergence(symbol, interval = "60") {
  const candles = await getCandles(symbol, interval, 100);
  const closes = candles.map(c => c.close);
  const macd = calculateMACD(closes.slice(-50)); // Cortamos para se alinhar com ema26

  const divergence = findMACDDivergence(closes.slice(-macd.length), macd);

  if (divergence) {
    const message = `🚨 Divergência MACD detectada em ${symbol} (${interval}min):\n- ${divergence}`;
   // await sendAlert(message);
    return {
      symbol,
      interval,
      divergence,
      message,
      timestamp: Date.now()
    };
  }

  return null;
}

module.exports = { detectMACDDivergence };
