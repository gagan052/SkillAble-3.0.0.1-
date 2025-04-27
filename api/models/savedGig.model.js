import mongoose from "mongoose";
const { Schema } = mongoose;

const savedGigSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  gigId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

// Compound index to ensure a user can only save a gig once
savedGigSchema.index({ userId: 1, gigId: 1 }, { unique: true });

export default mongoose.model("SavedGig", savedGigSchema);