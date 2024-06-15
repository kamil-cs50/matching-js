const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

// Initialize the express application
const app = express();

// This token you have in your environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const websiteUrl = process.env.WEBSITE_URL;

// Create a bot that uses 'webhook' to fetch new updates
const bot = new TelegramBot(token);

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
            await bot.sendMessage(chatId, "Welcome! Let's start the game. 🎮")
                .then(message => {
                    console.log('Sent simple welcome message:', JSON.stringify(message, null, 2));
                })
                .catch(error => {
                    console.error('Failed to send welcome message:', error.toString());
                    throw error;
                });

            await delay(500);  // Delay to help with rate limiting

            // Send the message with the PLAY button
            await bot.sendMessage(chatId, "Play the game to earn points! 🔥", {
                reply_markup: {
                    inline_keyboard: [[{
                        text: "PLAY 🎮",
                        web_app: { url: websiteUrl }
                    }]]
                }
            })
                .then(playMessageResponse => {
                    console.log('Sent message with keyboard:', JSON.stringify(playMessageResponse, null, 2));

                    return playMessageResponse.message_id; // Return this for pinning
                })
                .catch(error => {
                    console.error('Failed to send message with keyboard:', error.toString());
                    throw error;
                })
                .then(async (messageId) => {
                    // Pin the text message if possible
                    await delay(500);  // Additional delay to help with rate limiting
                    await bot.pinChatMessage(chatId, messageId, { disable_notification: true })
                        .then(pinResponse => {
                            console.log('Pinned message:', JSON.stringify(pinResponse, null, 2));
                        })
                        .catch(error => {
                            console.error('Failed to pin message:', error.toString());
                            throw error;
                        });
                })
                .catch(error => {
                    console.error('Error in chaining promises:', error.toString());
                });

        } catch (error) {
            console.error('Error in /start command processing:', error.toString());
        }
    }
});

module.exports = app;