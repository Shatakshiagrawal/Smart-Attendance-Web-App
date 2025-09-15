import Semester from '../models/Semester.js';
import Student from '../models/Student.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new semester/subject offering
// @route   POST /api/semesters
// @access  Private (Teacher only)
const createSemester = asyncHandler(async (req, res) => {
    const { subjectName, subjectCode, semesterNumber } = req.body;
    const teacherId = req.user._id;

    if (!subjectName || !subjectCode || !semesterNumber) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const studentsInSemester = await Student.find({ currentSemester: semesterNumber }).select('_id');
    const studentIds = studentsInSemester.map(student => student._id);

    const semester = await Semester.create({
        subjectName,
        subjectCode,
        semesterNumber,
        teacher: teacherId,
        students: studentIds
    });

    if (semester) {
        res.status(201).json(semester);
    } else {
        res.status(400);
        throw new Error('Invalid semester data');
    }
});

// @desc    Get all subjects for the logged-in teacher with student details
// @route   GET /api/semesters/my-subjects
// @access  Private (Teacher only)
const getMySubjects = asyncHandler(async (req, res) => {
    // FIX: Populate student details when fetching subjects
    const subjects = await Semester.find({ teacher: req.user._id }).populate('students', 'name enrollmentNo');
    res.json(subjects);
});

// FIX: New function to add a student to a semester
// @desc    Add a student to a specific semester
// @route   POST /api/semesters/:semesterId/students
// @access  Private (Teacher only)
const addStudentToSemester = asyncHandler(async (req, res) => {
    const { enrollmentNo } = req.body;
    const { semesterId } = req.params;

    if (!enrollmentNo) {
        res.status(400);
        throw new Error('Enrollment number is required');
    }

    const semester = await Semester.findById(semesterId);
    if (!semester) {
        res.status(404);
        throw new Error('Semester not found');
    }

    // Ensure the teacher owns this semester
    if (semester.teacher.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to modify this class.');
    }

    const student = await Student.findOne({ enrollmentNo });
    if (!student) {
        res.status(404);
        throw new Error(`Student with enrollment number "${enrollmentNo}" not found.`);
    }

    // Check if student is already enrolled
    if (semester.students.includes(student._id)) {
        res.status(400);
        throw new Error('Student is already enrolled in this class.');
    }

    semester.students.push(student._id);
    await semester.save();
    
    // Repopulate to send back full student details
    const updatedSemester = await Semester.findById(semesterId).populate('students', 'name enrollmentNo');

    res.status(200).json({
        message: 'Student added successfully.',
        semester: updatedSemester,
    });
});


export { createSemester, getMySubjects, addStudentToSemester };