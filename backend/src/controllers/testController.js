const Question = require('../models/Question');
const Submission = require('../models/Submission');
const Result = require('../models/Result');

// Admin adding questions
exports.addQuestion = async (req, res) => {
    try {
        const { round, type, question, options, correctAnswer, marks, negativeMarks } = req.body;
        const newQuestion = await Question.create({
            round, type, question, options, correctAnswer, marks, negativeMarks
        });
        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get questions for a round (SAFE: no correct answers)
exports.getQuestions = async (req, res) => {
    try {
        const { round } = req.params;

        // Check if team is qualified for round 2
        if (round == 2) {
            const result = await Result.findOne({ teamId: req.user._id, round: 1, qualified: true });
            if (!result && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not qualified for Round 2' });
            }
        }

        let questions = await Question.find({ round }).select('-correctAnswer');

        // Randomize order per request
        questions = questions.sort(() => Math.random() - 0.5);

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit Round 1 (Bulk or Single)
// Requirement says "Submit answers → backend validates"
// I'll implement bulk submission for the whole round
exports.submitRound1 = async (req, res) => {
    try {
        const { answers, timeTaken } = req.body; // answers: [{ questionId, selectedAnswer }]
        const teamId = req.user._id;

        // Prevent duplicate attempts
        const existingResult = await Result.findOne({ teamId, round: 1 });
        if (existingResult) {
            return res.status(400).json({ message: 'Round 1 already submitted' });
        }

        let totalScore = 0;
        const submissions = [];

        for (const ans of answers) {
            const question = await Question.findById(ans.questionId);
            if (!question) continue;

            let marksAwarded = 0;
            if (ans.selectedAnswer === question.correctAnswer) {
                marksAwarded = question.marks || 4;
            } else if (ans.selectedAnswer) {
                marksAwarded = question.negativeMarks || -1;
            }

            totalScore += marksAwarded;
            submissions.push({
                teamId,
                questionId: ans.questionId,
                selectedAnswer: ans.selectedAnswer,
                marksAwarded,
                timeTaken: 0, // Individual time not tracked per question usually, but could be
                round: 1
            });
        }

        await Submission.insertMany(submissions);
        const result = await Result.create({
            teamId,
            totalScore,
            totalTime: timeTaken,
            round: 1,
            qualified: false
        });

        res.json({ message: 'Submission successful', totalScore });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit Round 2
exports.submitRound2 = async (req, res) => {
    try {
        const { answers } = req.body;
        const teamId = req.user._id;

        // Check qualification
        const qualified = await Result.findOne({ teamId, round: 1, qualified: true });
        if (!qualified) {
            return res.status(403).json({ message: 'Not qualified for Round 2' });
        }

        const existingResult = await Result.findOne({ teamId, round: 2 });
        if (existingResult) {
            return res.status(400).json({ message: 'Round 2 already submitted' });
        }

        let totalScore = 0;
        const submissions = [];

        for (const ans of answers) {
            const question = await Question.findById(ans.questionId);
            if (!question) continue;

            // Logic-based or exact match for Round 2
            let marksAwarded = 0;
            if (ans.selectedAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
                marksAwarded = question.marks || 10;
            }

            totalScore += marksAwarded;
            submissions.push({
                teamId,
                questionId: ans.questionId,
                selectedAnswer: ans.selectedAnswer,
                marksAwarded,
                round: 2
            });
        }

        await Submission.insertMany(submissions);
        await Result.create({
            teamId,
            totalScore,
            round: 2
        });

        res.json({ message: 'Round 2 submission successful', totalScore });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Select Teams for Round 2
exports.qualifyTeams = async (req, res) => {
    try {
        const { teamIds } = req.body;
        await Result.updateMany(
            { teamId: { $in: teamIds }, round: 1 },
            { $set: { qualified: true } }
        );
        res.json({ message: 'Teams qualified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const { round } = req.params;
        const leaderboard = await Result.find({ round })
            .populate('teamId', 'teamName username')
            .sort({ totalScore: -1, totalTime: 1 });
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
