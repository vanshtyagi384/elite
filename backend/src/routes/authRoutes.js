const express = require('express');
const router = express.Router();
const { login, createTeam, getAllTeams } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/teams', protect, admin, createTeam);
router.get('/teams', protect, admin, getAllTeams);

module.exports = router;
