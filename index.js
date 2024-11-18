const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const express = require('express');

// Ваши API ключи
const telegramToken = '7913961398:AAFjaj6Q4oHE-Dbtmr79mzJYybZPVCG53cU';
const googleApiKey = 'AIzaSyA-3QDY_SAj9jhgIACoi_xra3L-tlPKFVQ';

const bot = new Telegraf(telegramToken);
const app = express();

app.use(express.json());
app.use(bot.webhookCallback('/webhook'));

// Универсальный обработчик для всех запросов на /webhook для отладки
app.all('/webhook', (req, res) => {
  console.log('Получен запрос на /webhook:', req.method, req.body);
  res.status(200).send('OK');
});

// Устанавливаем Webhook для Telegram
bot.telegram.setWebhook('https://telegram-google-bot-v2.vercel.app/webhook');

// Простая обработка сообщений для теста
bot.on('text', async (ctx) => {
  try {
    const userMessage = ctx.message.text;
    console.log(`Получено сообщение от пользователя: ${userMessage}`);
    ctx.reply(`Вы написали: ${userMessage}`);
  } catch (error) {
    console.error('Ошибка при обработке сообщения:', error);
    ctx.reply('Произошла ошибка при обработке вашего сообщения.');
  }
});

// Обработчик для корневого маршрута
app.get('/', (req, res) => {
  res.send('Бот работает!');
});

// Запуск Express-сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = app;
