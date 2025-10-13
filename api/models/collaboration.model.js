import mongoose from "mongoose";
const { Schema } = mongoose;

const CollaborationSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    skillsRequired: {
      type: [String],
      required: true,
    },
    positions: [
      {
        role: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          required: true,
          min: 1,
        },
        filled: {
          type: Number,
          default: 0,
        },
      },
    ],
    applicants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        roleApplied: {
          type: String,
          required: true,
        },
        message: {
          type: String,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    mode: {
      type: String,
      enum: ["Paid", "Unpaid"],
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Collaboration", CollaborationSchema);