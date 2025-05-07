const {
    detectPatterns,
    detectMediaBreak,
    detectRSIDivergence,
    detectMACDDivergence,
    detectRSIMACDDivergence,
    detectPullback,
    detectChartPatterns
} = require("./strategies");

const { sendAlert } = require("./services/telegramService");
const { saveSignalToFile } = require("./utils/saveSignal");

const SYMBOLS = [
    "FOXYUSDT", "FUELUSDT", "SPECUSDT", "KAITOUSDT", "COOKIEUSDT",
    "VIRTUALUSDT", "AI16ZUSDT", "AIXBTUSDT", "REXUSDT", "STPTUSDT",
    "LISTAUSDT", "CVXUSDT", "MDTUSDT", "ELXUSDT", "VRAUSDT",
    "PENGUUSDT", "SUNDOGUSDT", "CARVUSDT", "AXLUSDT", "ACXUSDT",
    "ALUUSDT", "LTCUSDT", "SAGAUSDT", "POPCATUSDT", "AVAAIUSDT"
];

const STRATEGIES = [
    { name: "Padrões de Candles", fn: detectPatterns, key: "patterns" },
    { name: "Rompimento de Médias", fn: detectMediaBreak, key: "breakMessages" },
    { name: "Divergência RSI", fn: detectRSIDivergence, key: "divergence" },
    { name: "Divergência MACD", fn: detectMACDDivergence, key: "divergence" },
    { name: "Divergência RSI+MACD", fn: detectRSIMACDDivergence, key: "type" },
    { name: "Pullback S/R", fn: detectPullback, key: "message" },
    { name: "Padrões Gráficos", fn: detectChartPatterns, key: "patterns" },
];

async function executeAnalysis(intervalsToRun = ["60", "240", "D"]) {
    const now = new Date().toLocaleTimeString();
    console.log(`⏱️ Execução iniciada às ${now} para intervals: ${intervalsToRun.join(", ")}`);

    const groupedMessages = []; // <- Aqui armazenaremos todos os alertas

    for (const interval of intervalsToRun) {
        for (const symbol of SYMBOLS) {
            const results = [];

            for (const { name, fn, key } of STRATEGIES) {
                try {
                    const result = await fn(symbol, interval);
                    if (result && result[key]) {
                        results.push({ strategy: name, content: result[key] });

                        // Salva individualmente para histórico local
                        saveSignalToFile({
                            symbol,
                            interval,
                            timestamp: Date.now(),
                            strategy: name,
                            content: result[key]
                        });
                    }
                } catch (err) {
                    console.error(`❌ Erro em ${name} (${symbol}/${interval}):`, err.message);
                }
            }

            if (results.length > 0) {
                const mensagens = results.map(r => {
                  const content = Array.isArray(r.content)
                    ? r.content.map(item =>
                        typeof item === "object" && item !== null
                          ? item.name || JSON.stringify(item)
                          : item
                      ).join(", ")
                    : typeof r.content === "object" && r.content !== null
                      ? r.content.name || JSON.stringify(r.content)
                      : r.content;
              
                  return `🔹 *${r.strategy}*: ${content}`;
                });
              
                groupedMessages.push({
                  symbol,
                  interval,
                  messages: mensagens
                });
              } else {
                console.log(`🔍 Sem sinais para ${symbol} (${interval})`);
            }
        }
    }

    for (const msg of groupedMessages) {
        const alertText = `🚨 *Sinais para ${msg.symbol} (${msg.interval}) - ${now}*\n\n` + msg.messages.join("\n");
        await sendAlert(alertText);
        await new Promise(res => setTimeout(res, 1000)); // intervalo de 1s para evitar flood
      }

    console.log(`✅ Execução finalizada às ${new Date().toLocaleTimeString()}`);
}

module.exports = executeAnalysis;
