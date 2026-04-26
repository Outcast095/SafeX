const userService = require('../service/user-service')
const {validationResult} = require('express-validator');

class UserControllet {
    
    async registration (req, res, next) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }

            
            const { email, password } = req.body;
            const userData = await userService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch(error) {
            next(error) 
        }
    }


    async login (req, res, next) {
        try {

        } catch(error) {
               next(error) 
        }
    }

    async logout (req, res, next) {
        try {

        } catch(error) {
                next(error) 
        }
    }

    async activate (req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL)
        } catch(error) {
                console.log(error)
        }
    }

    async refresh (req, res, next) {
        try {

        } catch(error) {
                next(error) 
        }
    }

    async getUser (req, res, next) {
        try {
                res.json(['123', '456'])
        } catch(error) {
                next(error) 
        }
    }
}

module.exports = new UserControllet()