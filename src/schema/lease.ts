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
  }
}, { timestamps: true });

const Lease = mongoose.models.Lease || mongoose.model('Lease', leaseSchema);
export default Lease;