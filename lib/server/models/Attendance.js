import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
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
        // FIX: Added a field to store the fixed number of chunks.
        numChunks: { type: Number, required: true },
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