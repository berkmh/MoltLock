const TelegramBot = require('node-telegram-bot-api');

// Paste your token from BotFather right here:
const token = '8695726187:AAHFb0AB8XlwORCvNV-fbdsEVPyFMmdqL8s'; 

const bot = new TelegramBot(token, {polling: true});

console.log("Listening for messages... Go to Telegram and send your bot a message (like 'hello').");

bot.on('message', (msg) => {
  console.log(`\n✅ Success! Your Chat ID is: ${msg.chat.id}`);
  console.log("Copy this ID, then press Ctrl+C to exit.");
});
