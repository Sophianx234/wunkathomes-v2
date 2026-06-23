import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager'],
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // The Admin who sent the invite
  },
  token: {
    type: String,
    required: true, // A secure random string sent in the email link
  },
  expiresAt: {
    type: Date,
    required: true, // Usually set to 7 days from creation
  }
}, { timestamps: true });

// Optional: Automatically delete the document when the expiresAt date passes
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);
export default Invitation;
