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
const bot = new TelegramBot(token, { polling: false });

// Parse the updates to JSON
app.use(bodyParser.json());

// Define the endpoint that is used by Telegram webhook
app.post('/', (req, res) => {
    console.log('Received webhook data:', JSON.stringify(req.body, null, 2));
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Helper function to delay actions (to prevent rate limiting)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Listen for messages from users
bot.on('message', async (msg) => {
    console.log('Received message:', JSON.stringify(msg, null, 2));
    const chatId = msg.chat.id;

    if (msg.text === '/start') {
        console.log('Handling /start command for chat:', chatId);

        try {
            // Send a simple text message first
            const messageResponse = await bot.sendMessage(chatId, "Welcome! Let's start the game. 🎮");
            console.log('Sent simple welcome message:', JSON.stringify(messageResponse, null, 2));

            await delay(500);  // Delay to help with rate limiting

            // Send the GIF
            const docResponse = await bot.sendDocument(chatId, gifUrl).catch(error => {
                console.error('Error sending GIF:', error.toString());
                return null;  // Return null to avoid breaking the flow
            });
            if (docResponse) {
                console.log('Sent GIF:', JSON.stringify(docResponse, null, 2));
            }

            await delay(500);  // Delay to help with rate limiting

            // Send the message with the PLAY button
            const playMessageResponse = await bot.sendMessage(chatId, "Play the game to earn points! 🔥", {
                reply_markup: {
                    inline_keyboard: [[{
                        text: "PLAY 🎮",
                        web_app: { url: websiteUrl }
                    }]]
                }
            }).catch(error => {
                console.error('Error sending PLAY message:', error.toString());
                return null;
            });
            if (playMessageResponse) {
                console.log('Sent message with keyboard:', JSON.stringify(playMessageResponse, null, 2));
            }

            await delay(500);  // Delay to help with rate limiting

            // Pin the text message if possible
            if (playMessageResponse) {
                const pinResponse = await bot.pinChatMessage(chatId, playMessageResponse.message_id, { disable_notification: true }).catch(error => {
                    console.error('Error pinning message:', error.toString());
                    return null;
                });
                if (pinResponse) {
                    console.log('Pinned message:', JSON.stringify(pinResponse, null, 2));
                }
            }

        } catch (error) {
            console.error('Error in /start command:', error.toString());
        }
    }
});

module.exports = app;