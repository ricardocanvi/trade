const { getCandles } = require("../services/bybitService");
const { sendAlert } = require("../services/telegramService");

function calculateSMA(data, period) {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, v) => acc + v, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

// Nova função: permite fechamento acima com parte do corpo tocando a média
function isValidBreak(open, close, ma) {
  const min = Math.min(open, close);
  const max = Math.max(open, close);

  return (
    // corpo cruza completamente a média
    (open < ma && close > ma) || (close < ma && open > ma) ||
    // candle fecha acima da média e o corpo toca nela
    (close > ma && min <= ma && max >= ma)
  );
}

async function detectMediaBreak(symbol, interval = "60") {
  const candles = await getCandles(symbol, interval, 250);
  const closes = candles.map(c => c.close);
  const last = candles[candles.length - 1];
  const open = last.open;
  const close = last.close;

  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma100 = calculateSMA(closes, 100);
  const sma200 = calculateSMA(closes, 200);
  const ema200 = calculateEMA(closes, 200);

  const crossMsgs = [];

  if (isValidBreak(open, close, sma20[sma20.length - 1])) crossMsgs.push("📈 Rompimento SMA 20");
  if (isValidBreak(open, close, sma50[sma50.length - 1])) crossMsgs.push("📈 Rompimento SMA 50");
  if (isValidBreak(open, close, sma100[sma100.length - 1])) crossMsgs.push("📈 Rompimento SMA 100");
  if (isValidBreak(open, close, sma200[sma200.length - 1])) crossMsgs.push("📈 Rompimento SMA 200");
  if (isValidBreak(open, close, ema200[ema200.length - 1])) crossMsgs.push("📈 Rompimento EMA 200");

  if (crossMsgs.length > 0) {
    const message = `🚨 Rompimento de média detectado em ${symbol} (${interval}min):\n- ${crossMsgs.join("\n- ")}`;
   // await sendAlert(message);
    return {
      symbol,
      interval,
      message,
      breakMessages: crossMsgs,
      timestamp: Date.now()
    };
  }

  return null;
}

module.exports = { detectMediaBreak };
