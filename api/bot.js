require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Load environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const gifUrl = process.env.GIF_URL;
const websiteUrl = process.env.WEBSITE_URL;

const bot = new TelegramBot(token);

module.exports = async (req, res) => {
    const body = req.body;

    if (!body) {
        return res.status(400).send('Bad Request');
    }

    try {
        // Iterate over each update
        if (body.message) {
            const msg = body.message;
            const chatId = msg.chat.id;

            // Respond to the /start command
            if (msg.text === '/start') {
                // Send the GIF
                await bot.sendDocument(chatId, gifUrl);

                // Then, send the message with the PLAY button
                const message = await bot.sendMessage(chatId, "Play the game to earn points! 🔥", {
                    reply_markup: {
                        inline_keyboard: [[{
                            text: "PLAY 🎮",
                            web_app: { url: process.env.WEBSITE_URL }
                        }]]
                    }
                });

                // Pin the text message
                await bot.pinChatMessage(chatId, message.message_id, { disable_notification: true });
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).send('Internal Server Error');
    }
};