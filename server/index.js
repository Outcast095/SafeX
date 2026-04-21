
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const mongoose = require('mongoose'); // Import mongoose for MongoDB connection


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json)
app.use(cookieParser())
app.use(cors())

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

start()