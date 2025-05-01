import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";

export const createStory = async (req, res, next) => {
  try {
    // Require user to be logged in
    if (!req.userId) return next(createError(401, "You must be logged in"));

    // Create story with user data from request
    const newStory = new Story({
      userId: req.userId,
      ...req.body,
    });

    const savedStory = await newStory.save();
    
    res.status(201).json(savedStory);
  } catch (err) {
    next(err);
  }
};

export const getAllStories = async (req, res, next) => {
  try {
    // Find all non-expired stories and populate with user information
    const currentTime = new Date();
    
    const stories = await Story.find({ 
      expiresAt: { $gt: currentTime } 
    }).sort({ createdAt: -1 });
    
    if (!stories.length) {
      return res.status(200).json([]);
    }
    
    // Get unique user IDs from stories
    const userIds = [...new Set(stories.map(story => story.userId))];
    
    // Fetch all users in one query
    const users = await User.find({ _id: { $in: userIds } });
    
    // Create a user map for quick lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user._id] = {
        username: user.username,
        img: user.img
      };
    });
    
    // Add user data to each story
    const storiesWithUserData = stories.map(story => {
      const userData = userMap[story.userId] || { username: "Unknown User", img: null };
      
      return {
        _id: story._id,
        userId: story.userId,
        imageUrl: story.imageUrl,
        text: story.text,
        views: story.views,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        username: userData.username,
        userImg: userData.img
      };
    });
    
    res.status(200).json(storiesWithUserData);
  } catch (err) {
    next(err);
  }
};

export const getUserStories = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Find all non-expired stories for the specified user
    const currentTime = new Date();
    
    const stories = await Story.find({ 
      userId,
      expiresAt: { $gt: currentTime } 
    }).sort({ createdAt: -1 });
    
    if (!stories.length) {
      return res.status(200).json([]);
    }
    
    // Get user info
    const user = await User.findById(userId);
    
    if (!user) {
      return next(createError(404, "User not found"));
    }
    
    // Add user data to each story
    const storiesWithUserData = stories.map(story => {
      return {
        _id: story._id,
        userId: story.userId,
        imageUrl: story.imageUrl,
        text: story.text,
        views: story.views,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        username: user.username,
        userImg: user.img
      };
    });
    
    res.status(200).json(storiesWithUserData);
  } catch (err) {
    next(err);
  }
};

export const viewStory = async (req, res, next) => {
  try {
    // Require user to be logged in
    if (!req.userId) return next(createError(401, "You must be logged in"));

    const { id } = req.params;
    
    // Find the story
    const story = await Story.findById(id);
    
    if (!story) {
      return next(createError(404, "Story not found"));
    }
    
    // Don't mark your own story as viewed
    if (story.userId === req.userId) {
      return res.status(200).json({ message: "Cannot mark your own story as viewed" });
    }
    
    // Only add to views if not already viewed
    if (!story.views.includes(req.userId)) {
      // Add user to views
      await Story.findByIdAndUpdate(id, {
        $addToSet: { views: req.userId }
      });
    }
    
    res.status(200).json({ message: "Story marked as viewed" });
  } catch (err) {
    next(err);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    // Find the story
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return next(createError(404, "Story not found"));
    }
    
    // Check if user is the owner
    if (story.userId !== req.userId) {
      return next(createError(403, "You can only delete your own stories"));
    }
    
    // Delete the story
    await Story.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "Story has been deleted" });
  } catch (err) {
    next(err);
  }
}; 