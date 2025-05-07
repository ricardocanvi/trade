const { getCandles } = require("../../services/bybitService");
const { sendAlert } = require("../../services/telegramService");
const detectWedge = require("./detectWedge");
const detectChannel = require("./detectChannel");
const detectFlag = require("./detectFlag");
const detectCupHandle = require("./detectCupHandle");
const detectOCO = require("./detectOCO");

async function detectChartPatterns(symbol, interval = "60") {
  const candles = await getCandles(symbol, interval, 200); // pode ajustar

  const patterns = [];

  const wedge = detectWedge(candles);
  if (wedge) patterns.push(wedge);

  const channel = detectChannel(candles);
  if (channel) patterns.push(channel);

  const flag = detectFlag(candles);
  if (flag) patterns.push(flag);

  const cup = detectCupHandle(candles);
  if (cup) patterns.push(cup);

  const oco = detectOCO(candles);
  if (oco) patterns.push(oco);

  if (patterns.length > 0) {
    const message = `🚨 Padrões gráficos detectados em ${symbol} (${interval}min):\n- ${patterns.map(p => p.name).join("\n- ")}`;
    //await sendAlert(message);

    return {
      symbol,
      interval,
      patterns,
      message,
      timestamp: Date.now()
    };
  }

  return null;
}

module.exports = { detectChartPatterns };
