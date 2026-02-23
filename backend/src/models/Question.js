const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    round: { type: Number, enum: [1, 2], required: true },
    type: { type: String, enum: ['mcq', 'problem'], required: true },
    question: { type: String, required: true },
    options: [{ type: String }], // Only for MCQ
    correctAnswer: { type: String, required: true }, // For MCQ: option; For Problem: script or exact text
    marks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: -1 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);
