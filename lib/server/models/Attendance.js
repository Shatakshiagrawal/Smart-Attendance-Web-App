import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    // FIX: Added a direct reference to the Teacher model.
    // This is crucial for security and for verifying session ownership.
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    semester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true
    },
    date: {
        type: Date,
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