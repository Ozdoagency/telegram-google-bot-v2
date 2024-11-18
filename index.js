const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
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

// Функция для анализа текста через Google AI (анализ настроений)
async function analyzeText(text) {
  try {
    console.log('Отправка запроса к Google API с текстом:', text);

    const response = await fetch(`https://language.googleapis.com/v1/documents:analyzeSentiment?key=${googleApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document: { type: 'PLAIN_TEXT', content: text },
        encodingType: 'UTF8',
      }),
    });

    console.log('Ответ Google API статус:', response.status);

    if (!response.ok) {
      console.error('Ошибка ответа Google API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Текст ошибки от Google API:', errorText);
      throw new Error(`Ошибка Google API: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Данные ответа Google API:', data);

    if (!data.documentSentiment) {
      console.error('Ответ Google API не содержит поля documentSentiment:', data);
      throw new Error('Некорректный ответ Google API');
    }

    return data.documentSentiment;
  } catch (error) {
    console.error('Ошибка при обращении к Google API:', error);
    throw error;
  }
}

// Обработка входящих сообщений
bot.on('text', async (ctx) => {
  try {
    const userMessage = ctx.message.text;
    const sentiment = await analyzeText(userMessage);
    ctx.reply(`Sentiment score: ${sentiment.score}, magnitude: ${sentiment.magnitude}`);
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
