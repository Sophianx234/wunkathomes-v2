import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
  lockId: { type: mongoose.Schema.Types.ObjectId, ref: 'SmartLock', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  action: { 
    type: String, 
    enum: [
      'PIN_RESET', 'TEMP_PIN_CREATED', 'REMOTE_UNLOCK', 'PIN_REVOKED', 'LEASE_ACTIVATED',
      'PHYSICAL_UNLOCK', 'ALARM_TRIGGERED', 'ALARM_CLEARED'
    ], 
    required: true 
  },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorType: { type: String, enum: ['Admin', 'Tenant', 'System', 'Hardware'] },
  performedBy: { type: String }, // e.g., 'Admin', 'Tenant', or an ID (legacy, keeping for backwards compat momentarily or just deprecating)
  metadata: {
    targetName: String,
    expiresAt: Date,
    leaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease' },
  }
}, { timestamps: true });

const AccessLog = mongoose.models.AccessLog || mongoose.model('AccessLog', accessLogSchema);
export default AccessLog;
