import mongoose from 'mongoose';

const cleaningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  leaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease',
    required: true,
  },
  scheduleType: {
    type: String,
    enum: ['custom', 'daily', 'weekly'],
    required: true,
  },
  customDates: [{
    type: Date,
  }],
  weeklyDays: [{
    type: Number, // 0 = Sunday, 1 = Monday, etc.
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active',
  }
}, { timestamps: true });

const CleaningSchedule = mongoose.models.CleaningSchedule || mongoose.model('CleaningSchedule', cleaningSchema);

export default CleaningSchedule;
