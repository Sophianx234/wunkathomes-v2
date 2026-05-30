import mongoose from 'mongoose';

const savedPropertySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  property: {
    // Note: If your actual listings are stored in a different model 
    // (like 'Listing'), change the ref to match that model.
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing',
    required: true,
  },
  
}, { timestamps: true });

// Add a compound index to prevent a user from saving the exact same property twice
savedPropertySchema.index({ user: 1, property: 1 }, { unique: true });

const SavedProperty = mongoose.models.SavedProperty || mongoose.model('SavedProperty', savedPropertySchema);
export default SavedProperty;