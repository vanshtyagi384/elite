const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const users = await User.find({ role: 'team' }).select('teamName username isQualifiedForRound2');
        console.log(JSON.stringify(users.map(u => ({ team: u.teamName, id: u.username, qualified: u.isQualifiedForRound2 })), null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error("DB Error:", err.message);
        process.exit(1);
    });
