const axios = require("axios");
const { TELEGRAM_TOKEN, CHAT_ID } = require("../config/telegram");

async function sendAlert(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text: message
  });
}

module.exports = { sendAlert };
