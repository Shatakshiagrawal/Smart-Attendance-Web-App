import express from 'express';
import { startAttendance, refreshAnimationSequence, markAttendance, completeAttendanceSession,getAttendanceSessionStatus,manualMarkAttendance } from '../controllers/attendanceController.js';
import { protect, teacherOnly, studentOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Teacher routes
router.post('/start', protect, teacherOnly, startAttendance);
router.post('/complete', protect, teacherOnly, completeAttendanceSession);
router.post('/refresh-sequence', protect, teacherOnly, refreshAnimationSequence); // NEW: Route to refresh the puzzle
router.post('/manual-mark', protect, teacherOnly, manualMarkAttendance); // <-- Add new route for manual marking
router.get('/session/:id', protect, teacherOnly, getAttendanceSessionStatus); // <-- Add new route for live status

// Student route
router.post('/mark', protect, studentOnly, markAttendance);

export default router;