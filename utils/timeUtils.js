function getCurrentHourMinute() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    return { hour, minute };
  }
  
  module.exports = { getCurrentHourMinute };
  