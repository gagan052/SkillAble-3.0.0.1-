import mongoose from "mongoose";

const { Schema } = mongoose;

const StorySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
    views: {
      type: [String], // Array of user IDs who viewed the story
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      index: { expires: 0 } // This will expire/delete the document at the specified expiresAt time
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Story", StorySchema); 