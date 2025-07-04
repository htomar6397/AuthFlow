import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import connectDB from './config/db.js';
import { applyRateLimit } from './middleware/rateLimiterMiddleware.js';
import { authenticate } from './middleware/authMiddleware.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

app.use(cookieParser());
app.use(applyRateLimit);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticate, userRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3001;

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
