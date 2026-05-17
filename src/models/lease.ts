import mongoose from 'mongoose';

const leaseSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // The Tenant
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date, // Nullable if it's a permanent sale
  },
  totalRentAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending_Deposit', 'Pending_Balance', 'Active', 'Expired', 'Cancelled'],
    default: 'Pending_Deposit',
  },
  documentUrl: {
    type: String, // Link to the signed PDF agreement
  },
  // Add this inside your Lease schema
signatureAudit: {
  isSigned: { type: Boolean, default: false },
  signedAt: { type: Date },
  ipAddress: { type: String }, // e.g., "197.251.x.x"
  userAgent: { type: String }, // e.g., "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0...)"
  typedName: { type: String }, // The exact name they typed to sign
  documentHash: { type: String } // Optional: A cryptographic hash of the PDF to prove it wasn't altered
}
}, { timestamps: true });

const Lease = mongoose.models.Lease || mongoose.model('Lease', leaseSchema);
export default Lease;