// =============================================
//  ФАЙЛ: server.js (или index.js)
//  Основной файл запуска Express-сервера
//  Подключает все необходимые модули и запускает приложение
// =============================================

require('dotenv').config(); // Загружаем переменные окружения из файла .env

const express = require('express');        // Основной фреймворк для создания веб-сервера
const cors = require('cors');              // Middleware для разрешения CORS-запросов (чтобы фронтенд мог обращаться к API)
const cookieParser = require('cookie-parser'); // Middleware для удобной работы с cookies
const mongoose = require('mongoose');      // ODM-библиотека для работы с MongoDB
const router = require('./router/index');  // Подключаем главный роутер приложения

const app = express();                     // Создаём экземпляр Express-приложения

const PORT = process.env.PORT || 5000;     // Порт сервера (берём из .env или используем 5000 по умолчанию)

// =============================================
//  Настройка middleware (промежуточного ПО)
// =============================================
app.use(express.json());                   // Позволяет парсить JSON в теле запроса (req.body)
app.use(cookieParser());                   // Парсит cookies из заголовков запроса
app.use(cors());                           // Включает CORS (по умолчанию разрешает все источники)
app.use('/api', router);                   // Все маршруты, начинающиеся с /api, обрабатываются в роутере

// =============================================
//  Асинхронная функция запуска сервера
// =============================================
const start = async () => {
    try {
        // Подключение к MongoDB
        await mongoose.connect(process.env.DB_URL);
        console.log('✅ MongoDB connected successfully');

        // Запуск сервера ТОЛЬКО после успешного подключения к БД
        app.listen(PORT, () => {
            console.log(`🚀 Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error.message);
       
        // Если не смогли подключиться к БД — не запускаем сервер
        process.exit(1);
    }
};

// Запускаем сервер
start();