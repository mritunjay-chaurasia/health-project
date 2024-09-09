const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid'); // For UUID generation if needed

const sampleReportsSchema = new Schema({
    id: {
        type: String,
        default: uuidv4, 
        required: true,
        unique: true
    },
    name:{
        type:String
    },
    gender: {
        type: String
    },
    age: {
        type: Number
    },
    race: {
        type: String 
    },
    height: {
        type: String
    },
    weight: {
        type: String
    },
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true 
    },
}, {
    timestamps: true 
});

module.exports = mongoose.model('SampleReports', sampleReportsSchema);
