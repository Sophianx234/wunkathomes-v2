import mongoose from 'mongoose';
import { COMMON_AMENITIES } from '@/lib/constants';

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
    type: String,
    enum: COMMON_AMENITIES,
  }]
}, { timestamps: true });

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);
export default Property;
