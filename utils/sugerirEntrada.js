function normalizarTexto(valor) {
    if (typeof valor === "string") return valor.toLowerCase();
    if (typeof valor === "object" && valor?.name) return valor.name.toLowerCase();
    return "";
  }
  
  function calcularATR(candles, period = 14) {
    const trs = [];
    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const prev = candles[i - 1];
      const tr = Math.max(
        current.high - current.low,
        Math.abs(current.high - prev.close),
        Math.abs(current.low - prev.close)
      );
      trs.push(tr);
    }
    const atr = trs.slice(-period).reduce((a, b) => a + b, 0) / period;
    return atr || 0;
  }
  
  function calcularStops(candles, direcao = "long") {
    const lastCandle = candles.at(-1);
    const atr = calcularATR(candles, 14);
    const stopLoss = direcao === "long"
      ? lastCandle.close - atr * 1.5
      : lastCandle.close + atr * 1.5;
    const takeProfit = direcao === "long"
      ? lastCandle.close + atr * 3
      : lastCandle.close - atr * 3;
    return {
      stopLoss: stopLoss.toFixed(4),
      takeProfit: takeProfit.toFixed(4),
      atr: atr.toFixed(4)
    };
  }
  
  function sugerirEntrada(resultados, candles) {
    if (!candles || candles.length < 20) return null;

    const todos = resultados.flatMap(r => {
      const raw = r.content;
      if (Array.isArray(raw)) return raw.map(normalizarTexto);
      return [normalizarTexto(raw)];
    });
  
    const contem = termo => todos.some(texto => texto.includes(termo));
  
    let pontosLong = 0;
    let pontosShort = 0;
  
    if (contem("cunha de baixa")) pontosLong += 2;
    if (contem("ocoi")) pontosLong += 2;
    if (contem("xícara")) pontosLong += 1;
    if (contem("divergência de alta")) pontosLong += 2;
    if (contem("rsi sobrevendido")) pontosLong += 1;
    if (contem("pullback")) pontosLong += 1;
    if (contem("rompimento")) pontosLong += 1;
  
    if (contem("cunha de alta")) pontosShort += 2;
    if (contem("oco")) pontosShort += 2;
    if (contem("estrela cadente")) pontosShort += 1;
    if (contem("engolfo de baixa")) pontosShort += 2;
    if (contem("divergência de baixa")) pontosShort += 2;
    if (contem("rsi sobrecomprado")) pontosShort += 1;
  
    let direcao = null;
    let forca = null;
  
    if (pontosLong >= 5) [direcao, forca] = ["long", "FORTE"];
    else if (pontosLong >= 3) [direcao, forca] = ["long", "MODERADO"];
    else if (pontosLong >= 1) [direcao, forca] = ["long", "FRACO"];
  
    if (pontosShort >= 5) [direcao, forca] = ["short", "FORTE"];
    else if (pontosShort >= 3) [direcao, forca] = ["short", "MODERADO"];
    else if (pontosShort >= 1) [direcao, forca] = ["short", "FRACO"];
  
    if (!direcao) return null;
  
    const stops = calcularStops(candles, direcao);
    return `💡 *Sinal ${forca} de entrada ${direcao.toUpperCase()}*\n🎯 TP: ${stops.takeProfit} | 🛑 SL: ${stops.stopLoss} | ATR: ${stops.atr}`;
  }
  
  module.exports = { sugerirEntrada };
  