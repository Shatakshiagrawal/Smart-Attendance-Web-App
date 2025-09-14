import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // The timetable links a day and time slot to a specific Class ID.
    // This keeps the teacher model clean and avoids storing redundant subject/semester data.
    timetable: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true,
        },
        startTime: { type: String, required: true }, // Format "HH:MM", e.g., "09:00"
        endTime: { type: String, required: true },   // e.g., "10:00"
        semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true }
    }]
}, { timestamps: true });

// Hash password before saving
teacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with the hashed one
teacherSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;

