require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Load environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const gifUrl = process.env.GIF_URL;
const websiteUrl = process.env.WEBSITE_URL;

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Respond to the /start command
    if (msg.text === '/start') {
        // First, send the GIF
        await bot.sendDocument(chatId, gifUrl);

        // Then, send the message with the PLAY button
        const message = await bot.sendMessage(chatId, "Play the game to earn points! 🔥", {
            reply_markup: {
                inline_keyboard: [[{
                    text: "PLAY 🎮",
                    web_app: { url: websiteUrl }
                }]]
            }
        });

        // Pin the text message
        bot.pinChatMessage(chatId, message.message_id, { disable_notification: true });
    }
});

console.log('Bot server started in the polling mode...');