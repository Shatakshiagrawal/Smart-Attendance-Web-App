import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongoDb.js';
import authRoutes from './routes/authRoutes.js';
import semesterRoutes from './routes/semesterRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import timetableRoutes from './routes/timetableRoutes.js';

// --- Connect to Database ---
// Vercel provides environment variables automatically, so dotenv is not needed here.
connectDB();

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;