import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  // The frontend currently only captures the WhatsApp number, 
  // which acts as the primary identifier for the lead.
  phoneNumber: {
    type: String,
    required: true, 
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending_Time', 'Confirmed', 'Completed', 'No_Show', 'Converted'],
    default: 'Pending_Time', // Defaults to this because the exact hour isn't set yet
  },
  notes: {
    type: String,
    // The Admin uses this field after the tour to log negotiations or client feedback
    default: '', 
  }
}, { timestamps: true });

// Prevent Mongoose from recompiling the model if it already exists (Next.js hot-reloading safe)
const Tour = mongoose.models.Tour || mongoose.model('Tour', tourSchema);

export default Tour;
