import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  leaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // The person who paid
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentPurpose: {
    type: String,
    enum: ['Booking_Deposit', 'Rent_Balance', 'Monthly_Renewal', 'Purchase'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Paystack', 'Bank_Transfer', 'Cash'],
    required: true,
  },
  transactionReference: {
    type: String,
    required: true, // Paystack ID or Bank reference
    unique: true,
  },
  proofOfPaymentUrl: {
    type: String, // Image URL for uploaded bank transfer receipts
  },
  status: {
    type: String,
    enum: ['Pending_Verification', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending_Verification', // Bank transfers default to this until Admin approves
  }
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export default Transaction;