const cron = require("node-cron");
const executeAnalysis = require("./executeAnalysis");

// Timeframe de 1h — às 00:55, 01:55, ...
cron.schedule("55 * * * *", () => executeAnalysis(["60"]));

// Timeframe de 4h — às 03:55, 07:55, ...
cron.schedule("55 3,7,11,15,19,23 * * *", () => executeAnalysis(["240"]));

// Timeframe diário — às 19:30
cron.schedule("30 19 * * *", () => executeAnalysis(["D"]));