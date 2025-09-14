import express from "express";
import { getTeacherTimetable, addTimetableEntry, deleteTimetableEntry } from "../controllers/timetableController.js"

import { protect, teacherOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// The user ID is now retrieved from the JWT token, so we don't need it in the URL
router.get("/", protect, teacherOnly, getTeacherTimetable);
router.post("/", protect, teacherOnly, addTimetableEntry);
router.delete("/:entryId", protect, teacherOnly, deleteTimetableEntry);

export default router;
