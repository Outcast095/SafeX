const {Schema, model} = require('mongoose')

const userSchema - new Schema({
    email: {type: string, unique: true, require: true},
    password: {type: string, require: true},
    isActivated: {type: boolean, default: false},
    activationLink: {type: string},
})

module.exports = model("User", userSchema)