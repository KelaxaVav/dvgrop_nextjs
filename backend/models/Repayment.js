import mongoose from 'mongoose';

const RepaymentSchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Loan',
    required: true
  },
  emiNo: {
    type: Number,
    required: [true, 'Please add EMI number']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add due date']
  },
  amount: {
    type: Number,
    required: [true, 'Please add amount']
  },
  paidAmount: {
    type: Number
  },
  balance: {
    type: Number,
    required: [true, 'Please add balance amount']
  },
  paymentDate: {
    type: Date
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'online', 'cheque']
  },
  penalty: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'overdue'],
    default: 'pending'
  },
  remarks: {
    type: String
  },
  receiptNumber: {
    type: String
  },
  processedBy: {
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
RepaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Repayment', RepaymentSchema);