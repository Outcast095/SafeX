const {Schema, model} = require('mongoose')

const tokenSchema - new Schema({
    user: {type: Schema.Types.ObjectId, ref: "User"},
    refreshToken: {type: string, require: true},
})

module.exports = model("Token", tokenSchema)