import mongoose from 'mongoose';

const smartLockSchema = new mongoose.Schema({
  tuyaDeviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true }, // e.g., "Apt 4B - Front Door"
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
  status: { type: String, enum: ['online', 'offline', 'unassigned'], default: 'unassigned' },
  batteryLevel: { type: String, default: 'high' },
  lockState: { type: String, enum: ['locked', 'unlocked', 'unknown'], default: 'unknown' },
  doorState: { type: String, enum: ['closed', 'open', 'unknown'], default: 'unknown' },
  activeTempPins: [{
    pinId: String, // from Tuya
    name: String,
    pinMasked: String, // just last 3 digits e.g. "***456"
    validFrom: Date,
    expiresAt: Date
  }]
}, { timestamps: true });

const SmartLock = mongoose.models.SmartLock || mongoose.model('SmartLock', smartLockSchema);
export default SmartLock;
