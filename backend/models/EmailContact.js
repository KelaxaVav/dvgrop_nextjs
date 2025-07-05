import mongoose from 'mongoose';

const EmailContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  source: {
    type: String,
    enum: ['customer_registration', 'loan_approval', 'manual_entry'],
    required: true
  },
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer'
  },
  loanId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Loan'
  },
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'failed'],
    default: 'pending'
  },
  lastSyncedAt: {
    type: Date
  },
  tags: {
    type: [String]
  },
  isSubscribed: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set updatedAt date before saving
EmailContactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('EmailContact', EmailContactSchema);