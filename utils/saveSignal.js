const fs = require("fs");
const path = require("path");

function saveSignalToFile(signal) {
  const filePath = path.resolve(__dirname, "../data/signals.json");

  // Lê o conteúdo atual do arquivo (ou cria um array vazio)
  let signals = [];
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    try {
      signals = JSON.parse(raw);
    } catch (e) {
      console.error("⚠️ Erro ao ler signals.json:", e.message);
    }
  }

  // Adiciona novo sinal com timestamp
  signals.push({
    ...signal,
    savedAt: new Date().toISOString()
  });

  // Salva de volta
  fs.writeFileSync(filePath, JSON.stringify(signals, null, 2));
}

module.exports = { saveSignalToFile };
