import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    // Optional: store AI model info for bot messages
    modelInfo: {
      model: String,
      tokens: Number,
      responseTime: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, timestamp: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model("Message", messageSchema);