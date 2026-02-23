const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalScore: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    round: { type: Number, required: true },
    qualified: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
});

// Compound index to ensure uniqueness per team per round
resultSchema.index({ teamId: 1, round: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
