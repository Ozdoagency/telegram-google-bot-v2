const { Telegraf } = require('telegraf');
const express = require('express');

// Ваши API ключи
const telegramToken = '7913961398:AAFjaj6Q4oHE-Dbtmr79mzJYybZPVCG53cU'; // Токен Telegram
const googleApiKey = 'AIzaSyA-3QDY_SAj9jhgIACoi_xra3L-tlPKFVQ'; // Google API ключ
const vercelUrl = 'https://telegram-google-bot-v2.vercel.app'; // URL для Webhook

const bot = new Telegraf(telegramToken);
const app = express();

app.use(express.json()); // Для обработки JSON-запросов от Telegram
app.use(bot.webhookCallback('/webhook')); // Обработка Webhook

// Логирование всех запросов на /webhook для отладки
app.all('/webhook', (req, res) => {
  console.log('Получен запрос на /webhook:', req.method, req.body);
  res.status(200).send('OK');
});

// Устанавливаем Webhook для Telegram
bot.telegram.setWebhook(`${vercelUrl}/webhook`);

// Пример ответа на сообщение
bot.on('text', async (ctx) => {
  try {
    const userMessage = ctx.message.text;
    console.log(`Получено сообщение от пользователя: ${userMessage}`);

    // Если пользователь отправил "Привет"
    if (userMessage.toLowerCase() === 'привет') {
      await ctx.reply('Привет! Чем могу помочь?');
    } else {
      await ctx.reply('Я вас не понял. Напишите "Привет".');
    }
  } catch (error) {
    console.error('Ошибка при обработке сообщения:', error);
    ctx.reply('Произошла ошибка при обработке вашего сообщения. Пожалуйста, попробуйте позже.');
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
