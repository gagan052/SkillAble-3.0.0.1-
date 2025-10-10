import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import gigRoute from "./routes/gig.route.js";
import orderRoute from "./routes/order.route.js";
import conversationRoute from "./routes/conversation.route.js";
import messageRoute from "./routes/message.route.js";
import reviewRoute from "./routes/review.route.js";
import authRoute from "./routes/auth.route.js";
import followRoute from "./routes/follow.route.js";
import savedGigRoute from "./routes/savedGig.route.js";
import storyRoute from "./routes/story.route.js";
import notificationRoute from "./routes/notification.route.js";
import collaborationRoute from "./routes/collaboration.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
dotenv.config();
mongoose.set("strictQuery", true);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("✅ Connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
};

// const connect = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO);
//     console.log("Connected to mongoDB!");
//   } catch (error) {
//     console.log(error);
//   }
// };

// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cors({
  origin: [
    "http://localhost:5173",
     "http://localhost:5174",
     "https://skillable-freelancer.onrender.com",
     "https://new-skillable-frontend.onrender.com",
    "https://skillable-gagan.onrender.com",
    "https://skillable-3-0-0-1-gagan.onrender.com",

     
    ],
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());

app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.get("/api/saved-gigs/test", (req, res) => {
  res.json({ message: "Saved gigs route works!" });
});


app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/gigs", gigRoute);
app.use("/api/orders", orderRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/follows", followRoute);
app.use("/api/saved-gigs", savedGigRoute);
app.use("/api/stories", storyRoute);
app.use("/api/collaborations", collaborationRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";

  return res.status(errorStatus).send(errorMessage);
});

app.listen(8080, () => {
  connect();
  console.log("Backend server is running! at 8080");
});
