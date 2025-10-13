import mongoose from "mongoose";
const { Schema } = mongoose;

const CommunitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    members: {
      type: [
        {
          userId: {
            type: String,
            required: true,
          },
          role: {
            type: String,
            enum: ["admin", "moderator", "member"],
            default: "member",
          },
          joinedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    subgroups: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          description: {
            type: String,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          createdBy: {
            type: String,
            required: true,
          },
          members: {
            type: [String],
            default: [],
          },
          messages: {
            type: [
              {
                userId: String,
                username: String,
                text: String,
                createdAt: {
                  type: Date,
                  default: Date.now,
                },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },
    collaborations: {
      type: [
        {
          collaborationId: {
            type: String,
          },
          title: {
            type: String,
          },
          status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
          },
        },
      ],
      default: [],
    },
    polls: {
      type: [
        {
          title: {
            type: String,
            required: true,
          },
          description: {
            type: String,
          },
          options: [
            {
              text: {
                type: String,
                required: true,
              },
              votes: {
                type: Number,
                default: 0,
              },
              voters: {
                type: [String],
                default: [],
              },
            },
          ],
          createdAt: {
            type: Date,
            default: Date.now,
          },
          expiresAt: {
            type: Date,
          },
          status: {
            type: String,
            enum: ["active", "closed"],
            default: "active",
          },
        },
      ],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Community", CommunitySchema);