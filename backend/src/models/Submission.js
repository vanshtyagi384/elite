const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedAnswer: { type: String },
    marksAwarded: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 }, // in seconds
    round: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
