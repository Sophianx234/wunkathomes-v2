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
  roomType: {
    type: String,
    enum: ['Furnished', 'Empty'],
    default: 'Empty',
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


// Pre-save hook to auto-generate a unique slug from the title
listingSchema.pre('save', async function () {
  // Only generate if a slug isn't already set or if the document is new
  if (!this.isModified('slug') && this.slug) return 

  // 1. Use the newly discovered title field for the slug! 
  // (Fallback to 'property' just in case title is somehow missing)
  const baseString = this.title || 'property';
  
  // 2. Slugify it: "Luxury 2-Bedroom Suite" -> "luxury-2-bedroom-suite"
  let slug = baseString
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/(^-|-$)+/g, '');   // Trim dashes from start and end

  // 3. Ensure 100% uniqueness in the database
  const slugRegEx = new RegExp(`^(${slug})((-[0-9]*$)?)$`, 'i');
  const docsWithSlug = await mongoose.model('Listing').find({ slug: slugRegEx });

  if (docsWithSlug.length > 0) {
    slug = `${slug}-${docsWithSlug.length + 1}`;
  }

  this.slug = slug;
});


const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
export default Listing;
