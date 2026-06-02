import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  leaseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lease', 
    required: true 
  },
  listingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing', 
    required: true 
  },
  ticketNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'HVAC', 'Smart_Lock', 'Appliances', 'Structural', 'Other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Routine', 'High', 'Emergency'],
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  images: [{ 
    type: String // Array of URLs from your cloud storage (Cloudinary, AWS, etc.)
  }], 
  status: {
    type: String,
    enum: ['Pending', 'In_Progress', 'Resolved', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

const Maintenance = mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;