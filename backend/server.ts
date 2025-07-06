import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import passport from 'passport';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import connectDB from './config/db';
import googleStrategy from './config/googleStrategy';
import { applyRateLimit } from './middleware/rateLimiterMiddleware';
import { authenticate } from './middleware/authMiddleware';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middleware/errorMiddleware';
import serverless from 'serverless-http';

// Initialize Passport
passport.use(googleStrategy);

const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Initialize Passport and session management
app.use(passport.initialize());
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body instanceof Buffer) {
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch (e) {
      // If it's not valid JSON, leave it as is or handle as needed
      console.error('Failed to parse Buffer as JSON:', e);
    }
  }
  next();
}, express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
if (process.env.NODE_ENV === 'production') app.use(applyRateLimit);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticate, userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// Error handling middleware
app.use(globalErrorHandler);

connectDB();
// Start the server only if not in AWS Lambda environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
}

export const handler = serverless(app);
