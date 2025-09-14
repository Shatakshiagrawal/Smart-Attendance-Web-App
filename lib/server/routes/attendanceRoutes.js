import express from 'express';
import { startAttendance, refreshAnimationSequence, markAttendance, completeAttendanceSession } from '../controllers/attendanceController.js';
import { protect, teacherOnly, studentOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Teacher routes
router.post('/start', protect, teacherOnly, startAttendance);
router.post('/complete', protect, teacherOnly, completeAttendanceSession);
router.post('/refresh-sequence', protect, teacherOnly, refreshAnimationSequence); // NEW: Route to refresh the puzzle

// Student route
router.post('/mark', protect, studentOnly, markAttendance);

export default router;