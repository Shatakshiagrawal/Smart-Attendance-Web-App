import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Database & Route Imports ---
import connectDB from './config/mongoDb.js';
import authRoutes from './routes/authRoutes.js';
import semesterRoutes from './routes/semesterRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import timetableRoutes from './routes/timetableRoutes.js';

// --- Load Environment Variables ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// --- Connect to Database ---
connectDB();

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Mount Routes ---
// NOTE: We do NOT add the "/api" prefix here. 
// The API route file will handle that.
app.use('/auth', authRoutes);
app.use('/semesters', semesterRoutes);
app.use('/timetable', timetableRoutes);
app.use('/attendance', attendanceRoutes);

// --- Simple Health Check Route ---
app.get('/', (req, res) => {
  res.send('Backend API is running...');
});

app.use(notFound);
app.use(errorHandler);

// --- Export the app for Next.js ---
export default app;