const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

// Initialize the express application
const app = express();

// This token you have in your environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const gifUrl = process.env.GIF_URL;
const websiteUrl = process.env.WEBSITE_URL;

// Set the port for the Express app
const PORT = process.env.PORT || 3000;

// Function to delay for a specified amount of time in ms
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Create a bot that uses 'webhook' to fetch new updates
const bot = new TelegramBot(token);

// Webhook URL (You should set this up in Vercel and Telegram)
const webhookUrl = `${process.env.VERCEL_URL}/bot${token}`;

// Set the bot to use webhook
bot.setWebHook(webhookUrl);

// Parse the updates to JSON
app.use(bodyParser.json());

// Define the endpoint that is used by Telegram webhook
app.post(`/bot${token}`, async (req, res) => {
    try {
        if (req.body) {
            const chatId = req.body.message.chat.id;
            const text = req.body.message.text;

            if (text === '/start') {
                // Send the GIF with a delay
                await bot.sendDocument(chatId, gifUrl);
                await delay(80);

                // Send the message with the PLAY button
                const message = await bot.sendMessage(chatId, "Play the game to earn points! 🔥", {
                    reply_markup: {
                        inline_keyboard: [[{
                            text: "PLAY 🎮",
                            web_app: { url: websiteUrl }
                        }]]
                    }
                });
                await delay(80);

                // Pin the text message
                await bot.pinChatMessage(chatId, message.message_id, { disable_notification: true });
            } else if (text === '/send') {
                // Send the custom message with a delay
                await bot.sendMessage(chatId, "Here's your message! 📬");
                await delay(80);
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Error handling message:', error);
        res.sendStatus(500);
    }
});

// Start express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});