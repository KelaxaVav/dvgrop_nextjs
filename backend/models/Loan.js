import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const GuarantorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nic: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  occupation: {
    type: String,
    required: true
  },
  income: {
    type: Number,
    required: true
  }
});

const CollateralSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  // ownership: {
  //   type: String,
  //   required: true
  // }
});

const LoanSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
    required: true
  },
  type: {
    type: String,
    enum: ['personal', 'business', 'agriculture', 'vehicle', 'housing'],
    required: [true, 'Please specify loan type']
  },
  requestedAmount: {
    type: Number,
    required: [true, 'Please add requested amount']
  },
  approvedAmount: {
    type: Number
  },
  interestRate: {
    type: Number,
    required: [true, 'Please add interest rate']
  },
  period: {
    type: Number,
    required: [true, 'Please add loan period in months']
  },
  emi: {
    type: Number,
    required: [true, 'Please add EMI amount']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add loan start date']
  },
  purpose: {
    type: String,
    required: [true, 'Please add loan purpose']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'active', 'completed'],
    default: 'pending'
  },
  guarantor: GuarantorSchema,
  collateral: CollateralSchema,
  documents: [DocumentSchema],
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  disbursedDate: {
    type: Date
  },
  disbursedAmount: {
    type: Number
  },
  disbursementMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'cheque']
  },
  disbursementReference: {
    type: String
  },
  disbursedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  remarks: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // loan_id: {
  //   type: String,
  // }
});

// Set updatedAt date before saving
LoanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Loan', LoanSchema);