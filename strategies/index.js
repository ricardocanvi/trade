const { detectPatterns } = require("./candlePatterns");
const { detectMediaBreak } = require("./mediaBreakStrategy");
const { detectRSIDivergence } = require("./rsiDivergence");
const { detectMACDDivergence } = require("./macdDivergence");
const { detectRSIMACDDivergence } = require("./rsiMacdDivergence");
const { detectPullback } = require("./pullbackZones");
const { detectChartPatterns } = require("./patternStructures/patternScanner");

module.exports = {
  detectPatterns,
  detectMediaBreak,
  detectRSIDivergence,
  detectMACDDivergence,
  detectRSIMACDDivergence,
  detectPullback,
  detectChartPatterns
};
