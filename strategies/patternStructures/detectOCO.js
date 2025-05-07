// strategies/patternStructures/detectOCO.js

function findLocalMinima(data, range = 2) {
  const pivots = [];
  for (let i = range; i < data.length - range; i++) {
    const isMin =
      data.slice(i - range, i).every(val => data[i] < val) &&
      data.slice(i + 1, i + 1 + range).every(val => data[i] < val);

    if (isMin) {
      pivots.push({ index: i, value: data[i] });
    }
  }
  return pivots;
}

function detectOCO(candles) {
  const closes = candles.map(c => c.close);
  const lows = candles.map(c => c.low);

  const minima = findLocalMinima(lows, 2);
  if (minima.length < 3) return null;

  // Pega os 3 últimos fundos para análise
  const [left, head, right] = minima.slice(-3);

  const shouldersSimilar =
    Math.abs(left.value - right.value) / left.value < 0.1;

  const isOCOI =
    head.value < left.value &&
    head.value < right.value &&
    shouldersSimilar;

  if (isOCOI) {
    return {
      name: "🟩 OCOI (Invertido) - possível reversão de alta"
    };
  }

  return null;
}

module.exports = detectOCO;
