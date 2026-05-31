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
  legalName: {
    type: String, // Separate from the display 'name', this must match the ID exactly
  },
  dateOfBirth: {
    type: Date,
  },
  idDocumentType: {
    type: String,
    enum: ['GHA', 'VOTER'],
  },
  idDocumentNumber: {
    type: String,
    select: false, // Security: hide by default
  },
  idVerificationPhotoUrl: {
    type: String, // S3/Cloudinary link to the "Selfie with ID" photo
    select: false, 
  },
  accountStatus: {
  type: String,
  enum: ['Active', 'Suspended'],
  default: 'Active',
},
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;