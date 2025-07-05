import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  group: {
    type: String,
    required: true,
    enum: ['general', 'notification', 'security', 'advanced', 'collection_days']
  },
  description: {
    type: String
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Setting', SettingSchema);