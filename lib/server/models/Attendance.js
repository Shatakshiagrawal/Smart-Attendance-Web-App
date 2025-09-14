import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    semester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true
    },
    date: {
        type: Date,
        // FIX: The 'required: true' line has been removed to prevent the server crash.
        // The default value is sufficient to ensure the date is always set.
        default: Date.now
    },
    status: {
        type: String,
        enum: ['live', 'completed'],
        default: 'live'
    },
    qrSession: {
        animationSequence: [String],
        expiresAt: { type: Date, required: true }
    },
    records: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;