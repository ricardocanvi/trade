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
const { sugerirEntrada } = require("./utils/sugerirEntrada");
const { getCandles } = require("./services/bybitService");
const { detectTrendBreak } = require("./strategies/detectTrendBreak");




const SYMBOLS = [
    "REXUSDT", "IOUSDT", "SPECUSDT", "SAFEUSDT", "COOKIEUSDT",
    "VIRTUALUSDT", "AI16ZUSDT", "AIXBTUSDT", "MASAUSDT", "MOODENGUSDT",
    "NEIROETHUSDT", "DUCKUSDT", "PENGUUSDT", "HPOS10IUSDT", "BBUSDT",
    "FWOGUSDT", "TAIUSDT", "GRIFFAINUSDT", "ETHFIUSDT", "SWARMSUSDT",
    "BRETTUSDT", "GALAUSDT", "PIPPIUSDT", "JELLYJELLYUSDT", "PRCLUSDT",
    "MICHIUSDT", "EIGENUSDT", "SPXUSDT", "FOXYUSDT", "POPCATUSDT",
    "SHELLUSDT", "ENAUSDT", "CETUSUSDT", "ARCUSDT", "PNUTUSDT",
    "AVAAIUSDT", "PONKEUSDT", "GIGAUSDT", "MAVIAUSDT", "WIFUSDT",
    "L3USDT", "BCHUSDT", "PENDLEUSDT", "FXSUSDT", "ZEREBROUSDT",
    "BANUSDT", "SUIUSDT", "AIOZUSDT", "VRAUSDT", "DRIFTUSDT",
    "ENSUSDT", "SOLOUSDT", "DEEPUSDT", "HIGHUSDT", "AEROUSDT",
    "CGPTUSDT", "RAYDIUMUSDT", "TNSRUSDT", "AIUSDT", "LQTYUSDT",
    "VRUSDT", "MYROUSDT", "KOMAUSDT", "ZKUSDT", "INJUSDT",
];

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

async function executeAnalysis(intervalsToRun = ["60", "240", "D"]) {
    const now = new Date().toLocaleTimeString();
    console.log(`⏱️ Execução iniciada às ${now} para intervals: ${intervalsToRun.join(", ")}`);

    const groupedMessages = []; // <- Aqui armazenaremos todos os alertas

    for (const interval of intervalsToRun) {
        for (const symbol of SYMBOLS) {
            const results = [];
            const candles = await getCandles(symbol, interval, 100);
            if (!candles || candles.length < 20) {
                console.warn(`⚠️ Candles insuficientes para ${symbol} (${interval})`);
                continue;
            }

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

                const sugestao = sugerirEntrada(results);
                if (sugestao) mensagens.push(`\n💡 ${sugestao}`);

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
