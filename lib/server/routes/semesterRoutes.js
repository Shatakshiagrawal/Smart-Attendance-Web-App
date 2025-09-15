import express from 'express';
import { createSemester, getMySubjects, addStudentToSemester } from '../controllers/semesterController.js';
import { protect, teacherOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to create a new semester/subject
router.post('/', protect, teacherOnly, createSemester);

// Route to get all subjects for the currently logged-in teacher
router.get('/my-subjects', protect, teacherOnly, getMySubjects);

// FIX: New route to add a student to a specific semester
router.post('/:semesterId/students', protect, teacherOnly, addStudentToSemester);

export default router;