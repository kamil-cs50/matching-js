const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

// Initialize the express application
const app = express();

// This token you have in your environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const gifUrl = process.env.GIF_URL;
const websiteUrl = process.env.WEBSITE_URL;

// Create a bot that uses 'webhook' to fetch new updates
const bot = new TelegramBot(token);

// Parse the updates to JSON
app.use(bodyParser.json());

// Define the endpoint that is used by Telegram webhook
app.post('/', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Listen for messages from users
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === '/start') {
        // Send the GIF
        await bot.sendDocument(chatId, gifUrl).catch((error) => {
            console.error('Error sending GIF:', error.response.body);
        });

        // Send the message with the PLAY button
        const message = await bot.sendMessage(chatId, "Play the game to earn points! 🔥", {
            reply_markup: {
                inline_keyboard: [[{
                    text: "PLAY 🎮",
                    web_app: { url: websiteUrl }
                }]]
            }
        }).catch((error) => {
            console.error('Error sending message:', error.response.body);
        });

        // Pin the text message
        await bot.pinChatMessage(chatId, message.message_id, { disable_notification: true }).catch((error) => {
            console.error('Error pinning message:', error.response.body);
        });
    }
});

module.exports = app;