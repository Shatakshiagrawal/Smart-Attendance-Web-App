import mongoose from 'mongoose';

// This model represents a specific subject being taught in a specific semester.
// It acts as the central link between a teacher and a group of students.
const semesterSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true }, // e.g., "CS-301"
    semesterNumber: { type: Number, required: true }, // The semester this subject belongs to (e.g., 5)
    
    // Each subject offering is taught by a single teacher.
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    
    // A list of students enrolled in this specific subject for the semester.
    // This will be auto-populated by the backend when the teacher creates the subject.
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]

}, { 
    timestamps: true,
    // Create a compound index to ensure that a subject is only offered once per semester by a specific teacher.
    indexes: [{ fields: { subjectCode: 1, semesterNumber: 1, teacher: 1 }, unique: true }]
});

const Semester = mongoose.model('Semester', semesterSchema);
export default Semester;

