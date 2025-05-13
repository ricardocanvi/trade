const express = require("express");
const router = express.Router();
const { analyzeSymbol } = require("../controllers/analysisController");

router.post("/analyze", analyzeSymbol);

module.exports = router;