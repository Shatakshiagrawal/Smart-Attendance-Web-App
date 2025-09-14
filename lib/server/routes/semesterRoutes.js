import express from 'express';
import { createSemester, getMySubjects } from '../controllers/semesterController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming middleware is in this path

const router = express.Router();

// Route to create a new semester/subject
router.post('/', protect, createSemester);

// Route to get all subjects for the currently logged-in teacher
router.get('/my-subjects', protect, getMySubjects);

export default router;
