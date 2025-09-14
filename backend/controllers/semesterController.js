import Semester from '../models/Semester.js';
import Student from '../models/Student.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new semester/subject offering
// @route   POST /api/semesters
// @access  Private (Teacher only)
const createSemester = asyncHandler(async (req, res) => {
    const { subjectName, subjectCode, semesterNumber } = req.body;
    const teacherId = req.user._id; // Get teacher's ID from the protect middleware

    if (!subjectName || !subjectCode || !semesterNumber) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // --- Automatic Student Enrollment Logic ---
    // Find all students who are in the specified semester.
    const studentsInSemester = await Student.find({ currentSemester: semesterNumber }).select('_id');

    // Extract just the IDs from the student documents.
    const studentIds = studentsInSemester.map(student => student._id);

    // Create the new semester document in the database.
    const semester = await Semester.create({
        subjectName,
        subjectCode,
        semesterNumber,
        teacher: teacherId,
        students: studentIds // Automatically enroll the found students
    });

    if (semester) {
        res.status(201).json(semester);
    } else {
        res.status(400);
        throw new Error('Invalid semester data');
    }
});

// @desc    Get all subjects for the logged-in teacher
// @route   GET /api/semesters/my-subjects
// @access  Private (Teacher only)
const getMySubjects = asyncHandler(async (req, res) => {
    const subjects = await Semester.find({ teacher: req.user._id });
    res.json(subjects);
});


export { createSemester, getMySubjects };
