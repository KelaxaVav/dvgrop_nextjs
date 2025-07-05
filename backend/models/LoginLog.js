import mongoose from 'mongoose';

const LoginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: {
    type: Date
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'locked', 'logout'],
    required: true
  },
  failureReason: {
    type: String
  },
  sessionId: {
    type: String
  }
});

export default mongoose.model('LoginLog', LoginLogSchema);