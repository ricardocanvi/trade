const { getCandles } = require("../services/bybitService");
const { sugerirEntrada } = require("../utils/sugerirEntrada");
const {
  detectPatterns,
  detectMediaBreak,
  detectRSIDivergence,
  detectMACDDivergence,
  detectRSIMACDDivergence,
  detectPullback,
  detectChartPatterns,
  detectTrendBreak
} = require("../strategies");

const STRATEGIES = [
  { name: "Padrões de Candles", fn: detectPatterns, key: "patterns" },
  { name: "Rompimento de Médias", fn: detectMediaBreak, key: "breakMessages" },
  { name: "Divergência RSI", fn: detectRSIDivergence, key: "divergence" },
  { name: "Divergência MACD", fn: detectMACDDivergence, key: "divergence" },
  { name: "Divergência RSI+MACD", fn: detectRSIMACDDivergence, key: "type" },
  { name: "Pullback S/R", fn: detectPullback, key: "message" },
  { name: "Padrões Gráficos", fn: detectChartPatterns, key: "patterns" },
  { name: "Rompimento de LTA/LTB", fn: detectTrendBreak, key: "messages" },
];

exports.analyzeSymbol = async (req, res) => {
  const { symbol, interval } = req.body;

  if (!symbol || !interval) {
    return res.status(400).json({ error: "symbol e interval são obrigatórios" });
  }

  try {
    const results = [];
    const candles = await getCandles(symbol, interval, 100);

    if (!candles || candles.length < 20) {
      return res.status(400).json({ error: "candles insuficientes" });
    }

    for (const { name, fn, key } of STRATEGIES) {
      const result = await fn(symbol, interval);
      if (result && result[key]) {
        results.push({ strategy: name, result: result[key] });
      }
    }

    const suggestion = sugerirEntrada(results, candles);

    let tp = null, sl = null, atr = null;
    if (suggestion) {
      const match = suggestion.match(/TP: (\d+\.\d+) \| 🛑 SL: (\d+\.\d+) \| ATR: (\d+\.\d+)/);
      if (match) {
        [, tp, sl, atr] = match;
      }
    }

    return res.json({
      symbol,
      interval,
      strategies: results,
      entrySignal: suggestion,
      takeProfit: tp,
      stopLoss: sl,
      atr
    });
  } catch (err) {
    console.error("Erro na análise:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};