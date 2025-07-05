import mongoose from 'mongoose';

const LeaveDaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    unique: true
  },
  reason: {
    type: String,
    required: [true, 'Please add a reason']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('LeaveDay', LeaveDaySchema);