// strategies/patternStructures/detectCupHandle.js

function detectCupHandle(candles) {
    const len = candles.length;
    if (len < 40) return null;
  
    const closes = candles.map(c => c.close);
  
    const leftTop = closes.slice(-40, -30)[0];
    const bottom = Math.min(...closes.slice(-30, -15));
    const rightTop = closes.slice(-15, -10).slice(-1)[0];
  
    const handleStart = closes.slice(-10)[0];
    const handleEnd = closes.slice(-1)[0];
  
    const cupDepth = leftTop - bottom;
    const cupSymmetry = Math.abs(leftTop - rightTop) / leftTop;
    const handleDrop = (handleStart - handleEnd) / handleStart;
  
    const validCup =
      cupDepth > 0 &&
      cupSymmetry < 0.15 &&
      (leftTop - bottom) / bottom > 0.05;
  
    const validHandle = handleDrop >= 0 && handleDrop <= 0.1;
  
    if (validCup && validHandle) {
      return {
        name: "☕ Xícara com Alça - possível continuação de alta"
      };
    }
  
    return null;
  }
  
  module.exports = detectCupHandle;
  