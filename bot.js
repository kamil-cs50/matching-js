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
    console.log('Received webhook data:', JSON.stringify(req.body, null, 2));  // Log the incoming webhook payload
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Listen for messages from users
bot.on('message', async (msg) => {
    console.log('Received message:', JSON.stringify(msg, null, 2));  // Log the message object
    const chatId = msg.chat.id;

    if (msg.text === '/start') {
        console.log('Handling /start command for chat:', chatId);  // Log when handling /start

        try {
            // Send the GIF
            const docResponse = await bot.sendDocument(chatId, gifUrl).catch((error) => {
                console.error('Error sending GIF:', error.toString());
                return null;
            });
            console.log('Sent GIF:', JSON.stringify(docResponse, null, 2));

            // Send the message with the PLAY button
            const messageResponse = await bot.sendMessage(chatId, "Play the game to earn points! 🔥", {
                reply_markup: {
                    inline_keyboard: [[{
                        text: "PLAY 🎮",
                        web_app: { url: websiteUrl }
                    }]]
                }
            }).catch((error) => {
                console.error('Error sending message:', error.toString());
                return null;
            });
            console.log('Sent message:', JSON.stringify(messageResponse, null, 2));

            // Pin the text message
            const pinResponse = await bot.pinChatMessage(chatId, messageResponse.message_id, { disable_notification: true }).catch((error) => {
                console.error('Error pinning message:', error.toString());
                return null;
            });
            console.log('Pinned message:', JSON.stringify(pinResponse, null, 2));
        } catch (error) {
            console.error('Error in /start command:', error.toString());
        }
    }
});

module.exports = app;