const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');


class UserService {
    /**
     * Логика регистрации нового пользователя
     * @param {string} email 
     * @param {string} password 
     */
    async registration(email, password) {
        // 1. Проверяем, нет ли уже пользователя с таким email в базе
        const candidate = await UserModel.findOne({ email });

        if (candidate) {
            // Если нашли — выкидываем ошибку, чтобы контроллер её перехватил
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }

        // 2. Хешируем пароль. 
        // Цифра 3 — это количество раундов соления (salt). 
        // В продакшене обычно ставят 10-12, но для тестов 3 быстрее.
        const hashPassword = await bcrypt.hash(password, 3);

        // 3. Генерируем уникальную строку (ссылку) для активации аккаунта через почту
        const activationLink = uuid.v4();

        // 4. Создаем запись в базе данных
        const user = await UserModel.create({ 
            email, 
            password: hashPassword, 
            activationLink 
        });

        // 5. Отправляем письмо со ссылкой на почту пользователя
        // В mail-service внутри должна быть логика работы с Resend/Nodemailer
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        // 6. Используем DTO (Data Transfer Object)
        // Нам нужно выкинуть из объекта пользователя лишнее (пароль и т.д.)
        // Оставляем только id, email и статус активации для создания токена
        const userDto = new UserDto(user); 

        // 7. Генерируем пару токенов: Access (короткий) и Refresh (длинный)
        // Внутрь токена «зашиваем» данные из userDto
        const tokens = tokenService.generateTokens({ ...userDto });

        // 8. Сохраняем Refresh-токен в базу данных (связываем его с id пользователя)
        // Это нужно для возможности выхода (logout) и обновления сессии
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        // 9. Возвращаем результат: токены и данные пользователя
        return {
            ...tokens,
            user: userDto
        };
    }

    async activate(activationLink) {
        // 1. Находим пользователя по ссылке активации
        const user = await UserModel.findOne({ activationLink });

        if (!user) {
            // Если не нашли — выкидываем ошибку, чтобы контроллер её перехватил
            throw ApiError.BadRequest('Некорректная ссылка активации');
        }  
        user.isActivated = true; // Меняем статус активации на true
        await user.save(); // Сохраняем изменения в базе данных 
    }
}

// Экспортируем экземпляр класса (Singleton), чтобы использовать во всем приложении
module.exports = new UserService();