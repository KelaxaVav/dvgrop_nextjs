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

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  nic: {
    type: String,
    required: [true, 'Please add a NIC number'],
    unique: true,
    trim: true
  },
  dob: {
    type: Date,
    required: [true, 'Please add date of birth']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  maritalStatus: {
    type: String,
    enum: ['married', 'single'],
    required: [true, 'Please specify marital status']
  },
  occupation: {
    type: String,
    required: [true, 'Please add occupation']
  },
  income: {
    type: Number,
    required: [true, 'Please add monthly income']
  },
  bankAccount: {
    type: String
  },
  documents: [DocumentSchema],
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
  }
});

// Set updatedAt date before saving
CustomerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Customer', CustomerSchema);