import Follow from "../models/follow.model.js";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import { createNotificationHelper } from "./notification.controller.js";

export const createFollow = async (req, res, next) => {
  const { followedId } = req.body;
  const followerId = req.userId;

  // Prevent users from following themselves
  if (followerId === followedId) {
    return next(createError(400, "You cannot follow yourself"));
  }

  try {
    // Check if already following
    const existingFollow = await Follow.findOne({ followerId, followedId });
    if (existingFollow) {
      return next(createError(400, "You are already following this user"));
    }

    // Create new follow relationship
    const newFollow = new Follow({
      followerId,
      followedId,
    });

    await newFollow.save();
    
    // Increment the followersCount of the followed user
    await User.findByIdAndUpdate(followedId, { $inc: { followersCount: 1 } });
    
    // Create notification for the followed user
    const follower = await User.findById(followerId);
    await createNotificationHelper(
      followedId,
      followerId,
      "follow",
      `${follower.username} started following you`,
      followerId
    );
    
    res.status(201).send("Successfully followed user");
  } catch (err) {
    next(err);
  }
};

export const deleteFollow = async (req, res, next) => {
  const followedId = req.params.id;
  const followerId = req.userId;

  try {
    const follow = await Follow.findOneAndDelete({ followerId, followedId });
    
    if (!follow) {
      return next(createError(404, "You are not following this user"));
    }

    // Decrement the followersCount of the unfollowed user
    await User.findByIdAndUpdate(followedId, { $inc: { followersCount: -1 } });

    res.status(200).send("Successfully unfollowed user");
  } catch (err) {
    next(err);
  }
};

export const getFollowStatus = async (req, res, next) => {
  const followedId = req.params.id;
  const followerId = req.userId;

  try {
    const follow = await Follow.findOne({ followerId, followedId });
    res.status(200).send({ isFollowing: !!follow });
  } catch (err) {
    next(err);
  }
};

export const getFollowers = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const followers = await Follow.find({ followedId: userId });
    res.status(200).send(followers);
  } catch (err) {
    next(err);
  }
};

export const getFollowing = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const following = await Follow.find({ followerId: userId });
    res.status(200).send(following);
  } catch (err) {
    next(err);
  }
};