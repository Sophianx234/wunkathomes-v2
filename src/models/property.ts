import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  propertyType: {
    type: String,
    enum: ['Apartment_Building', 'Commercial', 'House', 'Land'],
    required: true,
  },
  location: {
    region: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String }, // Optional, based on your needs
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  landmarks: [{
    type: String, // e.g., ["Accra Mall", "Kotoka Airport"]
  }],
  generalAmenities: [{
    type: String, // e.g., ["Pool", "Security Guard", "Backup Generator"]
  }]
}, { timestamps: true });

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);
export default Property;
