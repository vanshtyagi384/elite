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
        console.error("Error adding question:", error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

// Get questions for a round (SAFE: no correct answers)
exports.getQuestions = async (req, res) => {
    try {
        const { round } = req.params;

        // Check if team is qualified for round 2
        if (round === '2' || round === 2) {
            const qualifiedByResult = await Result.findOne({ teamId: req.user._id, round: 1, qualified: true });

            if (!qualifiedByResult && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized or Round 2 not open' });
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
                marksAwarded = question.marks !== undefined ? question.marks : 4;
            } else if (ans.selectedAnswer && ans.selectedAnswer !== "") {
                marksAwarded = question.negativeMarks !== undefined ? question.negativeMarks : -1;
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

// Progressive Submit for Round 2 Question
exports.submitRound2Question = async (req, res) => {
    try {
        const { questionId, answer } = req.body;
        const teamId = req.user._id;

        // Check qualification
        const qualifiedByResult = await Result.findOne({ teamId, round: 1, qualified: true });
        if (!qualifiedByResult && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized or Round 2 not open' });
        }

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        // Check if already solved successfully
        const alreadyCorrect = await Submission.findOne({ teamId, round: 2, questionId, marksAwarded: { $gt: 0 } });
        if (alreadyCorrect) {
            return res.status(400).json({ message: 'Already solved this question correctly' });
        }

        let marksAwarded = 0;
        let isCorrect = false;

        if (answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
            marksAwarded = question.marks !== undefined ? question.marks : 10;
            isCorrect = true;
        }

        // Save submission attempt
        await Submission.create({
            teamId,
            questionId,
            selectedAnswer: answer,
            marksAwarded,
            round: 2
        });

        if (isCorrect) {
            // Update Result for Round 2
            let resultR2 = await Result.findOne({ teamId, round: 2 });
            if (!resultR2) {
                resultR2 = await Result.create({ teamId, round: 2, totalScore: marksAwarded });
            } else {
                resultR2.totalScore += marksAwarded;
                await resultR2.save();
            }
        }

        res.json({ isCorrect, marksAwarded });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Round 2 Progress for Team
exports.getRound2Progress = async (req, res) => {
    try {
        const teamId = req.user._id;

        // Check if team is qualified for round 2
        const qualifiedByResult = await Result.findOne({ teamId, round: 1, qualified: true });

        if (!qualifiedByResult && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized or Round 2 not open' });
        }

        const correctSubmissions = await Submission.find({ teamId, round: 2, marksAwarded: { $gt: 0 } }).select('questionId');
        const solvedQuestionIds = correctSubmissions.map(s => s.questionId);

        res.json({ solved: solvedQuestionIds });
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

// Admin Start Round 2 for All
exports.startRound2ForAll = async (req, res) => {
    try {
        const User = require('../models/User'); // lazy load to avoid any circular dependency, just in case

        // Mark all teams globally authorized for round 2
        await User.updateMany({ role: 'team' }, { $set: { isQualifiedForRound2: true } });
        res.json({ message: 'Round 2 started for all teams' });
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
