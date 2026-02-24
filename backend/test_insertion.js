require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        const payload = {
            round: 2,
            type: "problem",
            question: "Test Problem",
            options: ["", "", "", ""],
            correctAnswer: "4",
            marks: 4,
            negativeMarks: -1
        };
        const newQuestion = await Question.create(payload);
        console.log("Success:", newQuestion);
    } catch (e) {
        console.error("Error creating question:", e.message, e.errors);
    }
    process.exit(0);
}
run();
