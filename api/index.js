require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('../backend/src/config/db');

const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('../backend/src/routes/authRoutes');
const testRoutes = require('../backend/src/routes/testRoutes');

const app = express();

// Connect to Database
connectDB();

// Trust proxy if you are behind a load balancer (Render uses reverse proxies)
app.set('trust proxy', 1);

// Rate Limiting (Protects from DDoS/brute-force attacks up to 150+ users)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(compression()); // Compress all responses
app.use('/api', limiter); // Apply rate limiting to API routes
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Unified Vercel Deployment: Frontend is served directly by Vercel
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5001;

// Only start the server if we are running the file directly (not imported as a module by Vercel)
if (process.env.NODE_ENV !== 'production' || require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

// Export the app for Vercel Serverless Functions
module.exports = app;
