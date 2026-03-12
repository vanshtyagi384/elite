require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedTeams = async () => {
    await connectDB();

    try {
        console.log('Clearing existing teams...');
        await User.deleteMany({ role: 'team' });

        const teams = [];
        const password = 'teampassword123';

        for (let i = 1; i <= 400; i++) {
            teams.push({
                teamName: `Team ${i}`,
                username: `team${i}`,
                password: password,
                role: 'team'
            });
            if (i % 50 === 0) console.log(`Prepared ${i} teams...`);
        }

        console.log('Inserting 200 teams into database...');
        // Insert one by one to trigger pre-save hook for hashing or use a loop with create
        // Actually User.create(array) works and triggers hooks
        await User.create(teams);

        console.log('Successfully seeded 200 teams!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedTeams();
