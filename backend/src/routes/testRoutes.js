const express = require('express');
const router = express.Router();
const {
    addQuestion,
    getQuestions,
    submitRound1,
    submitRound2,
    qualifyTeams,
    getLeaderboard
} = require('../controllers/testController');
const { protect, admin } = require('../middleware/authMiddleware');

// Questions
router.post('/questions', protect, admin, addQuestion);
router.get('/questions/:round', protect, getQuestions);

// Submissions
router.post('/submit/round1', protect, submitRound1);
router.post('/submit/round2', protect, submitRound2);

// Admin actions
router.post('/qualify', protect, admin, qualifyTeams);
router.get('/leaderboard/:round', protect, getLeaderboard);

module.exports = router;
