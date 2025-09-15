import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import Semester from '../models/Semester.js';
import crypto from 'crypto';

const generateRandomString = (length) => crypto.randomBytes(length).toString('hex');

const startAttendance = asyncHandler(async (req, res) => {
    // ... (This function remains correct)
    console.log("[Backend Log] Received request to start attendance session.");
    try {
        const { semesterId } = req.body;
        const teacherId = req.user._id;

        if (!semesterId) {
            console.error("[Backend Log] Error: semesterId is missing from the request body.");
            res.status(400);
            throw new Error("Semester ID is required.");
        }

        const semester = await Semester.findById(semesterId).populate('students', 'name enrollmentNo');

        if (!semester) {
            console.error(`[Backend Log] Error: Semester with ID ${semesterId} not found.`);
            res.status(404);
            throw new Error('Semester not found. Please ensure the timetable is set up correctly.');
        }

        if (semester.teacher.toString() !== teacherId.toString()) {
            console.error(`[Backend Log] Security Error: Teacher ${teacherId} is not authorized for semester ${semesterId}.`);
            res.status(403);
            throw new Error('You are not authorized to start a session for this class.');
        }

        const numChunks = Math.floor(Math.random() * 4) + 4; //
        const secretChunks = Array.from({ length: numChunks }, () => generateRandomString(16));
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

        const attendanceSession = await Attendance.create({
            semester: semesterId,
            status: 'live',
            qrSession: {
                animationSequence: secretChunks,
                expiresAt: expiresAt,
            },
        });

        res.status(201).json({
            attendanceId: attendanceSession._id,
            animationSequence: attendanceSession.qrSession.animationSequence,
            expiresAt: attendanceSession.qrSession.expiresAt,
            totalStudents: semester.students.length,
            students: semester.students
        });

    } catch (error) {
        console.error("--- UNEXPECTED SERVER ERROR in startAttendance ---");
        console.error(error);
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
});

const getAttendanceSessionStatus = asyncHandler(async (req, res) => {
    // ... (This function remains correct)
    const { id } = req.params;
    const session = await Attendance.findById(id).populate({
        path: 'semester',
        select: 'students',
        populate: {
            path: 'students',
            select: 'name enrollmentNo'
        }
    });

    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    const presentStudentIds = new Set(session.records.map(record => record.student.toString()));

    res.status(200).json({
        presentCount: presentStudentIds.size,
        totalStudents: session.semester.students.length,
        allStudents: session.semester.students,
        presentStudentIds: Array.from(presentStudentIds),
    });
});

const manualMarkAttendance = asyncHandler(async (req, res) => {
    // ... (This function remains correct)
    const { attendanceId, studentIds } = req.body;

    if (!attendanceId || !Array.isArray(studentIds)) {
        res.status(400);
        throw new Error("Attendance ID and a list of student IDs are required.");
    }

    const session = await Attendance.findById(attendanceId);
    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    const alreadyPresentIds = new Set(session.records.map(record => record.student.toString()));
    const studentsToMark = studentIds.filter(id => !alreadyPresentIds.has(id));

    const newRecords = studentsToMark.map(studentId => ({
        student: studentId,
        timestamp: new Date(),
    }));

    if (newRecords.length > 0) {
        session.records.push(...newRecords);
        await session.save();
    }

    res.status(200).json({
        message: `${newRecords.length} students marked manually.`,
        totalMarked: session.records.length,
    });
});

const refreshAnimationSequence = asyncHandler(async (req, res) => {
    // ... (This function remains correct)
    const { attendanceId } = req.body;
    const session = await Attendance.findById(attendanceId);

    if (!session || session.status !== 'live' || new Date() > new Date(session.qrSession.expiresAt)) {
        res.status(404).json({ message: 'Session not found or has ended.' });
        return;
    }

    const numChunks = Math.floor(Math.random() * 5) + 8;
    const newSecretChunks = Array.from({ length: numChunks }, () => generateRandomString(16));

    session.qrSession.animationSequence = newSecretChunks;
    await session.save();

    res.status(200).json({
        message: "Sequence refreshed successfully",
        newAnimationSequence: newSecretChunks
    });
});

const completeAttendanceSession = asyncHandler(async (req, res) => {
    // ... (This function remains correct)
    const { attendanceId } = req.body;
    const teacherId = req.user._id;

    const session = await Attendance.findById(attendanceId).populate('semester');

    if (!session) {
        res.status(404).json({ message: 'Session not found.' });
        return;
    }

    if (session.semester.teacher.toString() !== teacherId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to modify this session.');
    }

    session.status = 'completed';
    session.qrSession.expiresAt = new Date();
    await session.save();

    res.status(200).json({ message: 'Attendance session has been successfully closed.' });
});

const markAttendance = asyncHandler(async (req, res) => {
    const { attendanceId, assembledSequence } = req.body;
    const studentId = req.user._id;

    if (!attendanceId || !Array.isArray(assembledSequence) || assembledSequence.length === 0) {
        res.status(400).json({ message: "A complete assembled sequence is required." });
        return;
    }

    const session = await Attendance.findById(attendanceId);
    if (!session || session.status !== 'live' || new Date() > new Date(session.qrSession.expiresAt)) {
        res.status(404).json({ message: 'Session is not active or has expired.' });
        return;
    }

    const serverSequence = session.qrSession.animationSequence;
    
    // FIX: Changed status code from 401 to 422 for sequence mismatch
    if (serverSequence.length !== assembledSequence.length || !serverSequence.every((val, index) => val === assembledSequence[index])) {
        res.status(422).json({ message: 'Invalid QR sequence. The code may have changed. Please try scanning again.' });
        return;
    }

    const isAlreadyMarked = session.records.some(record => record.student.toString() === studentId.toString());
    if (isAlreadyMarked) {
        return res.status(409).json({ message: 'Attendance already marked.' });
    }

    session.records.push({ student: studentId, timestamp: new Date() });
    await session.save();

    res.status(200).json({ message: 'Attendance marked successfully.' });
});

export { startAttendance, refreshAnimationSequence, markAttendance, completeAttendanceSession, getAttendanceSessionStatus, manualMarkAttendance };