import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/error.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Route files
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import customerRoutes from './routes/customers.js';
import loanRoutes from './routes/loans.js';
import paymentRoutes from './routes/payments.js';
import settingRoutes from './routes/settings.js';
import smsRoutes from './routes/sms.js';
import reportRoutes from './routes/reports.js';
import collectionDaysRoutes from './routes/collectionDays.js';

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/sms', smsRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/collection-days', collectionDaysRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});