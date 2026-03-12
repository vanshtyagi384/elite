const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 1, // Minimize connections per serverless instance
            connectTimeoutMS: 30000, // Wait up to 30s for connection
            socketTimeoutMS: 45000, // Wait up to 45s for queries
        });
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // In serverless, we shouldn't necessarily process.exit(1) on an intermittent failure
        // but here it's matching original behavior.
        process.exit(1);
    }
};

module.exports = connectDB;
