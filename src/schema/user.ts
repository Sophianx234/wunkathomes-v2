import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['Admin','Manager', 'User'],
    default: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true, 
  },
  profilePicture: {
    type: String,
    default: null,
  },
  // --- NEW KYC / IDENTITY FIELDS ---
  kycStatus: {
    type: String,
    enum: ['Unverified', 'Pending', 'Verified', 'Rejected'],
    default: 'Unverified',
  },
  ghanaCardNumber: {
    type: String,
    select: false, // Security: Prevents this field from being returned in standard queries unless explicitly requested
  },
  ghanaCardUrl: {
    type: String,
    select: false, // Security: Link to the uploaded image of the card (e.g., AWS S3 or Cloudinary)
  },
  accountStatus: {
  type: String,
  enum: ['Active', 'Suspended'],
  default: 'Active',
},
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;