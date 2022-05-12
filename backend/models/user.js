const mongoose = require('mongoose')

const validator = require('validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'User name is required']
    },
    email: {
        type:String,
        required: [true,'Email is required'],
        unique: [true, 'Email has already been taken'],
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    avatar: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ]
})


// Return JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

module.exports = mongoose.model('User', userSchema);