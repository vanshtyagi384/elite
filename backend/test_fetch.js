require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        const questionsStr = await Question.find({ round: "2" });
        console.log("Fetch by string '2':", questionsStr.length);
        const questionsNum = await Question.find({ round: 2 });
        console.log("Fetch by number 2:", questionsNum.length);
    } catch (e) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}
run();
