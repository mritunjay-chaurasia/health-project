const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const userSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    userType: {
        type: String,
        default: "user", // Default value is "user"
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
