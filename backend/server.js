import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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

// --- DYNAMIC CORS SETUP FOR DEPLOYMENT ---
const allowedOrigins = [
  'http://localhost:3000',
  process.env.NEXT_PUBLIC_API_URL // This should be your Vercel URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Mount Routes (without the '/api' prefix) ---
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

// --- Export the app for Vercel ---
export default app;