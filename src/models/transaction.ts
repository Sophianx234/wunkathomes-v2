import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
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
    // Populated later when the digital lease is generated
  },
  amount: {
    type: Number,
    required: true, // The amount the user was charged
  },
  currency: {
    type: String,
    enum: ['GHS', 'USD'],
    default: 'GHS',
  },
  paymentPurpose: {
    type: String,
    enum: ['Upfront_Rent', 'Rent_Balance', 'Monthly_Renewal', 'Purchase'],
    required: true,
  },
  // --- PAYSTACK SPECIFIC FIELDS ---
  reference: {
    type: String,
    required: true, 
    unique: true, // The unique string you passed to usePaystackPayment
  },
  paystackTransactionId: {
    type: String, 
    // Paystack's internal numerical ID (useful for webhooks and refunds)
  },
  channel: {
    type: String,
    enum: ['card', 'mobile_money', 'bank', 'pending'],
    default: 'pending',
    // Populated upon verification: Tells the admin if they paid via MTN, Visa, etc.
  },
  paystackFee: {
    type: Number,
    // Great for accounting: How much Paystack took from this transaction
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Refunded', 'Abandoned'],
    default: 'Pending', 
  },
  paidAt: {
    type: Date, // Exact timestamp from Paystack when funds cleared
  }
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export default Transaction;