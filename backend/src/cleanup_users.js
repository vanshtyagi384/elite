require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const cleanupUsers = async () => {
    await connectDB();

    try {
        console.log('Removing all team users from the database...');
        const result = await User.deleteMany({ role: 'team' });
        console.log(`Successfully removed ${result.deletedCount} team users.`);
        
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('Admin user "admin" remains in the database.');
        } else {
            console.warn('Warning: No admin user found. You may need to run seed.js again.');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

cleanupUsers();
