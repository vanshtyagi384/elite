const express = require('express');
const router = express.Router();
const {
    addQuestion,
    getQuestions,
    submitRound1,
    submitRound2,
    submitRound2Question,
    getRound2Progress,
    qualifyTeams,
    startRound2ForAll,
    getLeaderboard
} = require('../controllers/testController');
const { protect, admin } = require('../middleware/authMiddleware');

// Questions
router.post('/questions', protect, admin, addQuestion);
router.get('/questions/:round', protect, getQuestions);

// Submissions
router.post('/submit/round1', protect, submitRound1);
router.post('/submit/round2', protect, submitRound2); // legacy full submit
router.post('/submit/round2/question', protect, submitRound2Question);
router.get('/progress/round2', protect, getRound2Progress);

// Admin actions
router.post('/qualify', protect, admin, qualifyTeams);
router.post('/start-round2', protect, admin, startRound2ForAll);
router.get('/leaderboard/:round', protect, getLeaderboard);

module.exports = router;
