const { getCandles } = require("../services/bybitService");
const { calculateEMA, calculateStochastic } = require("../utils/indicators");

async function checkSignal(symbol) {
  const daily = await getCandles(symbol, "D");
  const hourly = await getCandles(symbol, "60");
  const fiveMin = await getCandles(symbol, "5");

  const emaDaily = calculateEMA(daily.map(c => c.close), 21);
  const isUptrend = daily[daily.length - 1].close > emaDaily[emaDaily.length - 1];

  if (!isUptrend) return null;

  const stochastic = calculateStochastic(hourly, 8);
  const isOversold = stochastic[stochastic.length - 1] < 20;

  if (!isOversold) return null;

  const ema9 = calculateEMA(fiveMin.map(c => c.close), 9);
  const ema21 = calculateEMA(fiveMin.map(c => c.close), 21);
  const lastIndex = ema9.length - 1;

  const crossedUp = ema9[lastIndex - 1] < ema21[lastIndex - 1] &&
                    ema9[lastIndex] > ema21[lastIndex];

  if (!crossedUp) return null;

  return {
    symbol,
    timestamp: Date.now(),
    message: `🚨 SINAL: ${symbol}\n• Tendência de alta no diário\n• Estocástico sobrevendido no 1H\n• Cruzamento de EMA9/EMA21 no 5min`
  };
}

module.exports = { checkSignal };
