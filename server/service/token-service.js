const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService {
    /**
     * Генерация пары токенов
     * @param {object} payload — данные пользователя (обычно id, email, isActivated), 
     * которые будут "зашиты" внутри токена.
     */
    generateTokens(payload) {
        // 1. Создаем Access Token. 
        // Он короткоживущий (30 мин). Нужен для каждого запроса к защищенным данным.
        // Если его украдут, он быстро протухнет.
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });

        // 2. Создаем Refresh Token. 
        // Он долгоживущий (30 дней). Нужен только для того, чтобы получить новый Access Token,
        // когда тот истечет, чтобы пользователю не пришлось заново вводить логин/пароль.
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

        return {
            accessToken,
            refreshToken
        };
    }

    /**
     * Сохранение Refresh токена в базу данных
     * Мы храним в базе только Refresh токен, чтобы иметь возможность 
     * принудительно разлогинить пользователя (удалив токен из базы).
     */
    async saveToken(userId, refreshToken) {
        // Проверяем, есть ли уже в базе запись о токене для этого пользователя
        const tokenData = await tokenModel.findOne({ user: userId });

        // Если запись нашлась — просто обновляем старый Refresh токен на новый
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save(); // Сохраняем изменения в БД
        }

        // Если пользователь заходит впервые (или токена в базе нет) — создаем новую запись
        const token = await tokenModel.create({ user: userId, refreshToken });
        return token;
    }


    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({refreshToken})
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({refreshToken})
        return tokenData;
    }
}

// Экспортируем экземпляр класса для использования в других частях приложения
module.exports = new TokenService();