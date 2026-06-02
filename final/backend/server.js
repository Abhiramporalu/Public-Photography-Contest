global.SlowBuffer = global.Buffer;
require('buffer').SlowBuffer = global.Buffer;

process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./utils/db');
dotenv.config(); // Load environment variables from .env file

// Import custom middleware
const { errorHandler } = require('./middleware/errorMiddleware');
const apiKeyMiddleware = require('./middleware/apiKeyMiddleware');

const app = express();

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // Dynamically allow localhost and vercel.app subdomains
        const isLocalhost = origin.startsWith('http://localhost:') || origin === 'http://localhost';
        const isVercel = origin.endsWith('.vercel.app');

        if (isLocalhost || isVercel) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // This allows the browser to send cookies with the requests
};
app.use(cors(corsOptions));


// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(helmet()); // Set security-related HTTP headers
app.use(morgan('common')); // Logging HTTP requests


// Connect to MongoDB
connectDB();

// Import routes
const contestRoutes = require('./routes/contestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const photoRoutes = require('./routes/photoRoutes');
const voteRoutes = require('./routes/voteRoutes');

// Use routes
app.use('/api/contests', contestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/votes', voteRoutes);

// Error handling middleware
app.use(errorHandler); // Custom error handler

// Start server (Only if not running in a serverless environment)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the app for Vercel Serverless Functions
module.exports = app;
