const { getCandles } = require("../services/bybitService");
const { sendAlert } = require("../services/telegramService");

function isBullishEngulfing(prev, curr) {
  return prev.close < prev.open &&
         curr.close > curr.open &&
         curr.open < prev.close &&
         curr.close > prev.open;
}

function isBearishEngulfing(prev, curr) {
  return prev.close > prev.open &&
         curr.close < curr.open &&
         curr.open > prev.close &&
         curr.close < prev.open;
}

function isHammer(c) {
  const body = Math.abs(c.close - c.open);
  const lowerShadow = c.open < c.close
    ? c.open - c.low
    : c.close - c.low;
  return lowerShadow > 2 * body && (c.high - Math.max(c.open, c.close)) < body;
}

function isInvertedHammer(c) {
  const body = Math.abs(c.close - c.open);
  const upperShadow = c.high - Math.max(c.open, c.close);
  return upperShadow > 2 * body && (Math.min(c.open, c.close) - c.low) < body;
}

function isHangingMan(c) {
  return isHammer(c) && c.close < c.open;
}

function isMarubozu(c) {
  return Math.abs(c.close - c.open) > (c.high - c.low) * 0.9;
}

function isDoji(c) {
  return Math.abs(c.open - c.close) <= (c.high - c.low) * 0.1;
}

function isMorningStar(c1, c2, c3) {
  return c1.close < c1.open &&
         isDoji(c2) &&
         c3.close > c3.open &&
         c3.close > (c1.open + c1.close) / 2;
}

function isShootingStar(c) {
  const body = Math.abs(c.open - c.close);
  const upperShadow = c.high - Math.max(c.open, c.close);
  const lowerShadow = Math.min(c.open, c.close) - c.low;
  return upperShadow > 2 * body && lowerShadow < body;
}

function isHarami(prev, curr) {
  return Math.abs(curr.open - curr.close) < Math.abs(prev.open - prev.close) &&
         curr.open > prev.close && curr.close < prev.open;
}

function isThreeWhiteSoldiers(candles) {
  return candles.slice(-3).every(c => c.close > c.open) &&
         candles[1].open > candles[0].open &&
         candles[2].open > candles[1].open;
}

function isThreeBlackCrows(candles) {
  return candles.slice(-3).every(c => c.close < c.open) &&
         candles[1].open < candles[0].open &&
         candles[2].open < candles[1].open;
}

async function detectPatterns(symbol, interval = "60") {
  const candles = await getCandles(symbol, interval, 50);
  const patterns = [];

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const [c1, c2, c3] = candles.slice(-3);

  if (isBullishEngulfing(prev, last)) patterns.push("📈 Engolfo de Alta");
  if (isBearishEngulfing(prev, last)) patterns.push("📉 Engolfo de Baixa");
  if (isHammer(last)) patterns.push("🔨 Martelo");
  if (isInvertedHammer(last)) patterns.push("🔄 Martelo Invertido");
  if (isHangingMan(last)) patterns.push("🧍 Enforcado");
  if (isMarubozu(last)) patterns.push("🟦 Marubozu");
  if (isDoji(last)) patterns.push("⚖️ Doji");
  if (isMorningStar(c1, c2, c3)) patterns.push("🌅 Estrela da Manhã");
  if (isShootingStar(last)) patterns.push("🌠 Estrela Cadente");
  if (isHarami(prev, last)) patterns.push("💡 Harami");
  if (isThreeWhiteSoldiers(candles)) patterns.push("🕊️ Três Soldados Brancos");
  if (isThreeBlackCrows(candles)) patterns.push("🕳️ Três Corvos Negros");

  if (patterns.length > 0) {
    const msg = `🚨 Padrões detectados em ${symbol} (${interval}min):\n- ${patterns.join("\n- ")}`;
  //  await sendAlert(msg);
    return { symbol, interval, patterns, message: msg, timestamp: Date.now() };
  }

  return null;
}

module.exports = { detectPatterns };
