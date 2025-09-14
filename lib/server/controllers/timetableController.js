import Teacher from "../models/Teacher.js";
import Semester from "../models/Semester.js";
import asyncHandler from 'express-async-handler';

/**
 * @desc    Get the full timetable of the logged-in teacher
 * @route   GET /api/timetable
 * @access  Private (Teacher only)
 */
export const getTeacherTimetable = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.user._id).populate({
    path: 'timetable.semester',
    select: 'subjectName subjectCode semesterNumber'
  });

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  res.json({
    success: true,
    message: "Timetable fetched successfully",
    timetable: teacher.timetable,
  });
});

/**
 * @desc    Add a new timetable entry for the logged-in teacher
 * @route   POST /api/timetable
 * @access  Private (Teacher only)
 */
export const addTimetableEntry = asyncHandler(async (req, res) => {
  const { semesterId, day, startTime, endTime } = req.body;
  const teacherId = req.user._id;

  if (!semesterId || !day || !startTime || !endTime) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }

  const semester = await Semester.findById(semesterId);
  if (!semester) {
    res.status(404);
    throw new Error("Semester not found");
  }

  // Security check: Ensure the teacher is the one assigned to this semester
  if (semester.teacher.toString() !== teacherId.toString()) {
    res.status(403);
    throw new Error("You are not authorized to add a class for this semester.");
  }

  const newEntry = {
    day,
    startTime,
    endTime,
    semester: semester._id,
  };

  teacher.timetable.push(newEntry);
  await teacher.save();

  res.status(201).json({
    success: true,
    message: "Timetable entry added successfully",
    timetable: teacher.timetable,
  });
});

/**
 * @desc    Delete a timetable entry for the logged-in teacher
 * @route   DELETE /api/timetable/:entryId
 * @access  Private (Teacher only)
 */
export const deleteTimetableEntry = asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const teacherId = req.user._id;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }

  const timetableEntry = teacher.timetable.id(entryId);
  if (!timetableEntry) {
    res.status(404);
    throw new Error("Timetable entry not found");
  }

  timetableEntry.deleteOne(); // Use deleteOne() to remove the subdocument
  await teacher.save();

  res.json({
    success: true,
    message: "Timetable entry deleted successfully",
    timetable: teacher.timetable,
  });
});
