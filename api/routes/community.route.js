import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createCommunity,
  getCommunities,
  getMyCommunities,
  getCommunity,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  createPoll,
  votePoll,
  addCollaboration,
  createSubgroup
} from "../controllers/community.controller.js";

const router = express.Router();

router.post("/", verifyToken, createCommunity);
router.get("/", verifyToken, getCommunities);
router.get("/my", verifyToken, getMyCommunities);
router.get("/:id", verifyToken, getCommunity);
router.put("/:id", verifyToken, updateCommunity);
router.post("/:id/join", verifyToken, joinCommunity);
router.post("/:id/leave", verifyToken, leaveCommunity);
router.post("/:id/polls", verifyToken, createPoll);
router.post("/:id/vote", verifyToken, votePoll);
router.post("/:id/collaborations", verifyToken, addCollaboration);
router.post("/:id/subgroups", verifyToken, createSubgroup);

export default router;