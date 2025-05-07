const executeAnalysis = require("./executeAnalysis");

// ⚙️ Simule execução para diferentes timeframes
async function test() {
  const args = process.argv.slice(2);
  const valid = ["60", "240", "D"];

  if (!args.length || !valid.includes(args[0])) {
    console.log("❌ Uso correto: node test.js [60|240|D]");
    return;
  }

  const timeframe = args[0];
  console.log(`🚀 Testando execução manual para timeframe ${timeframe}...\n`);
  await executeAnalysis([timeframe]);
}

test();
