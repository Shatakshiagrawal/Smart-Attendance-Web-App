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
 * @desc    Get the timetable for the logged-in student
 * @route   GET /api/timetable/student
 * @access  Private (Student only)
 */
export const getStudentTimetable = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    // FIX: Correctly populate the teacher's timetable to access class times and name
    const semesters = await Semester.find({ students: studentId }).populate({
      path: 'teacher',
      select: 'name timetable' // Ensure 'name' is also selected here
    });

    if (!semesters) {
        res.status(404);
        throw new Error('No classes found for this student');
    }

    const today = new Date();
    const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];

    const todayClasses = [];

    semesters.forEach(sem => {
        // Find the specific timetable entry for this semester and day from the teacher's timetable
        if (sem.teacher && sem.teacher.timetable) {
            const entry = sem.teacher.timetable.find(entry =>
                entry.semester.toString() === sem._id.toString() && entry.day === todayDayName
            );
            
            if (entry) {
                // Combine subject info with timetable entry
                todayClasses.push({
                    id: entry._id,
                    subject: sem.subjectName,
                    subjectCode: sem.subjectCode,
                    teacher: sem.teacher.name,
                    // FIX: Pass the time string directly to avoid timezone conversion issues on the client side.
                    startTime: `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}T${entry.startTime}:00`,
                    endTime: `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}T${entry.endTime}:00`,
                });
            }
        }
    });

    res.json({
        success: true,
        message: "Student timetable fetched successfully",
        timetable: todayClasses,
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
