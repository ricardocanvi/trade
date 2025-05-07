const axios = require("axios");

const BASE_URL = "https://api.bybit.com"; // ou use v5 endpoint se disponível

/**
 * Obtém candles históricos da Bybit
 * @param {string} symbol - Ex: "BTCUSDT"
 * @param {string} interval - Ex: "60", "240", "D"
 * @param {number} limit - Quantidade de candles (máximo recomendado: 200)
 * @returns {Promise<Array>} Lista de candles [{ open, high, low, close, volume }]
 */
async function getCandles(symbol, interval, limit = 200) {
  try {
    const res = await axios.get(`${BASE_URL}/v5/market/kline`, {
      params: {
        category: "linear",
        symbol,
        interval,
        limit
      },
      timeout: 8000 // 8 segundos de segurança
    });

    const data = res.data?.result?.list;

    if (!data || !Array.isArray(data)) {
      console.warn(`⚠️ Sem dados de candles para ${symbol} (${interval})`);
      return [];
    }

    // Transforma em objetos mais fáceis de manipular
    return data.map(item => ({
      timestamp: Number(item[0]),
      open: Number(item[1]),
      high: Number(item[2]),
      low: Number(item[3]),
      close: Number(item[4]),
      volume: Number(item[5])
    })).reverse(); // ordena do mais antigo para o mais recente

  } catch (err) {
    console.error(`❌ Erro ao buscar candles de ${symbol} (${interval}):`, err.message);
    return [];
  }
}

module.exports = { getCandles };
