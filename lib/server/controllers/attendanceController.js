import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import Semester from '../models/Semester.js';
import crypto from 'crypto';

// INCREASED COMPLEXITY: Generate a longer random string for each frame
const generateRandomString = (length) => crypto.randomBytes(length).toString('hex');

const startAttendance = asyncHandler(async (req, res) => {
    console.log("[Backend Log] Received request to start attendance session.");
    try {
        const { semesterId } = req.body;
        const teacherId = req.user._id;

        if (!semesterId) {
            console.error("[Backend Log] Error: semesterId is missing from the request body.");
            res.status(400);
            throw new Error("Semester ID is required.");
        }

        const semester = await Semester.findById(semesterId);

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

        // INCREASED COMPLEXITY: Generate more frames for the animation
        const numChunks = Math.floor(Math.random() * 5) + 8; // Now generates 8-12 chunks
        const secretChunks = Array.from({ length: numChunks }, () => generateRandomString(16)); // Longer, more complex data
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
        });

    } catch (error) {
        console.error("--- UNEXPECTED SERVER ERROR in startAttendance ---");
        console.error(error);
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
});

const refreshAnimationSequence = asyncHandler(async (req, res) => {
    const { attendanceId } = req.body;
    const session = await Attendance.findById(attendanceId);

    if (!session || session.status !== 'live' || new Date() > new Date(session.qrSession.expiresAt)) {
        res.status(404).json({ message: 'Session not found or has ended.' });
        return;
    }

    const numChunks = Math.floor(Math.random() * 5) + 8; // 8-12 chunks
    const newSecretChunks = Array.from({ length: numChunks }, () => generateRandomString(16)); // Longer data

    session.qrSession.animationSequence = newSecretChunks;
    await session.save();

    res.status(200).json({
        message: "Sequence refreshed successfully",
        newAnimationSequence: newSecretChunks
    });
});

const completeAttendanceSession = asyncHandler(async (req, res) => {
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
    if (serverSequence.length !== assembledSequence.length || !serverSequence.every((val, index) => val === assembledSequence[index])) {
        res.status(401).json({ message: 'Invalid QR sequence. Please try scanning again.' });
        return;
    }

    const updatedSession = await Attendance.findOneAndUpdate(
        {
            _id: attendanceId,
            'records.student': { $ne: studentId }
        },
        {
            $push: { records: { student: studentId, timestamp: new Date() } }
        },
        { new: true }
    );

    if (!updatedSession) {
        const alreadyMarkedSession = await Attendance.findById(attendanceId);
        if (alreadyMarkedSession && alreadyMarkedSession.records.some(record => record.student.toString() === studentId.toString())) {
            return res.status(409).json({ message: 'Attendance already marked.' });
        }
        return res.status(404).json({ message: 'Session not found or attendance could not be marked.' });
    }

    res.status(200).json({ message: 'Attendance marked successfully.' });
});

export { startAttendance, refreshAnimationSequence, markAttendance, completeAttendanceSession };