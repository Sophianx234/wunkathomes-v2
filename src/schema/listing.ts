import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  slug: { type: String, unique: true },
  listingType: {
    type: String,
    enum: ['For_Rent', 'For_Sale'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Pending', 'Rented', 'Sold'],
    default: 'Available',
  },
  price: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true, // e.g., "Master Bedroom with Balcony"
  },
  description: {
    type: String,
    required: true,
  },
  features: {
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    sizeSqm: { type: Number }, // Size in square meters
  },
  terms: {
    leaseTerm: { type: String }, // e.g., "1 Year Minimum" (Null for sales)
  },
  smartLock: {
    hasSmartLock: { type: Boolean, default: false },
    accessInstructions: { type: String, select: false }, // Hidden from public queries by default
  },
  images: [{
    type: String, // Array of image URLs
  }]
}, { timestamps: true });

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
export default Listing;