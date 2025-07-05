import mongoose from 'mongoose';

const SmsLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['loanApplication', 'loanApproval', 'paymentReceipt', 'latePayment', 'preDueReminder', 'loanRejection', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['delivered', 'failed', 'pending'],
    default: 'pending'
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  },
  error: {
    type: String
  },
  provider: {
    type: String,
    default: 'twilio'
  },
  messageId: {
    type: String
  }
});

export default mongoose.model('SmsLog', SmsLogSchema);