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
  passwordResetToken: {
    type: String,
    select: false, // Security: hide by default so it doesn't leak in API calls
  },
  passwordResetExpires: {
    type: Date, // Mongoose handles Date.now() integer conversion automatically
    select: false,
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
  idDocumentUrl: {
    type: String, // Link to the front scan of the Ghana Card
    select: false,
  },
  idVerificationPhotoUrl: {
    type: String, // Link to the security face photo taken in office
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
