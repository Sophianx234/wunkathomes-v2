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
    enum: [
      'Awaiting_Payment',       // User selected dates but hasn't paid
      'Pending_Verification',   // Paid, but needs to do the Selfie/ID step
      'Awaiting_Admin_Approval',// KYC submitted, Admin needs to check it
      'Active',                 // Admin approved, PIN issued, tenant is in
      'Expired',                // Lease ended naturally
      'Cancelled'               // Refunded or voided
    ],
    default: 'Awaiting_Payment',
  },
  documentUrl: {
    type: String, // Link to the signed PDF agreement
  },
  smartLockPin: {
    type: String,
    select: false, // Security: Never send this to the frontend unless explicitly requested
  },
  
  // ==========================================
  // NEW: DYNAMIC REMINDER MILESTONES
  // ==========================================
  reminders: {
    milestone1: { 
      triggerDate: { type: Date }, 
      sent: { type: Boolean, default: false } 
    }, // e.g., 50% through the lease
    milestone2: { 
      triggerDate: { type: Date }, 
      sent: { type: Boolean, default: false } 
    }, // e.g., 75% through the lease
    milestone3: { 
      triggerDate: { type: Date }, 
      sent: { type: Boolean, default: false } 
    }, // e.g., 90% through the lease
    expired: { 
      sent: { type: Boolean, default: false } 
    }  // Triggers when now >= endDate
  },
  intentToVacate: { 
  type: Boolean, 
  default: false 
},
moveOutDate: { 
  type: Date 
},

  signatureAudit: {
    isSigned: { type: Boolean, default: false },
    signedAt: { type: Date },
    ipAddress: { type: String }, 
    userAgent: { type: String }, 
    typedName: { type: String }, 
    documentHash: { type: String } 
  }
}, { timestamps: true });

// Prevent Mongoose from recompiling the model in Next.js development mode
const Lease = mongoose.models.Lease || mongoose.model('Lease', leaseSchema);
export default Lease;