const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid'); // For UUID generation if needed

const historyDetailsSchema = new Schema({
    id: {
        type: String,
        default: uuidv4,
        required: true,
        unique: true
    },
    fileName: {
        type: String,
        required: true
    },
    aiResponse: {
        type: Schema.Types.Mixed
    },
    aiBiomarkerResponse: {
        type: Schema.Types.Mixed
    },
    summary: {
        type: Schema.Types.Mixed
    },
    demoGraphicQuestions: {
        type: [Schema.Types.Mixed]
    },
    userId: {
        type: String,
        ref: 'User', // Reference to the User model
        required: true
    },
    rating: {
        type: String,
    },
    feedback: {
        type: String,
    },
    gender: {
        type: String,
    },
    age: {
        type: Number, // Use Number for age to handle numerical values
    },
    userDetails: {
        type: Object
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('HistoryDetails', historyDetailsSchema);
