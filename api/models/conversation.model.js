import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous conversations
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ createdAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
