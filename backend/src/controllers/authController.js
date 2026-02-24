const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                teamName: user.teamName,
                username: user.username,
                role: user.role,
                isQualifiedForRound2: user.isQualifiedForRound2,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTeam = async (req, res) => {
    try {
        const { teamName, username, password } = req.body;
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'Team already exists' });
        }

        const team = await User.create({
            teamName,
            username,
            password,
            role: 'team'
        });

        res.status(201).json({
            _id: team._id,
            teamName: team.teamName,
            username: team.username
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllTeams = async (req, res) => {
    try {
        const teams = await User.find({ role: 'team' }).select('-password');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
