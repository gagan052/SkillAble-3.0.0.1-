import createError from "../utils/createError.js";
import Review from "../models/review.model.js";
import Gig from "../models/gig.model.js";
import User from "../models/user.model.js";
import { createNotificationHelper } from "./notification.controller.js";

export const createReview = async (req, res, next) => {
  if (req.isSeller)
    return next(createError(403, "Sellers can't create a review!"));

  const newReview = new Review({
    userId: req.userId,
    gigId: req.body.gigId,
    desc: req.body.desc,
    star: req.body.star,
  });

  try {
    const review = await Review.findOne({
      gigId: req.body.gigId,
      userId: req.userId,
    });

    if (review)
      return next(
        createError(403, "You have already created a review for this gig!")
      );

    //TODO: check if the user purchased the gig.

    const savedReview = await newReview.save();

    const gig = await Gig.findByIdAndUpdate(req.body.gigId, {
      $inc: { totalStars: req.body.star, starNumber: 1 },
    });
    
    if (gig && gig.userId) {
      // Create notification for the gig owner
      const reviewer = await User.findById(req.userId);
      await createNotificationHelper(
        gig.userId,
        req.userId,
        "review",
        `${reviewer.username} left a ${req.body.star}-star review on your gig "${gig.title}"`,
        savedReview._id
      );
    }
    
    res.status(201).send(savedReview);
  } catch (err) {
    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ gigId: req.params.gigId });
    res.status(200).send(reviews);
  } catch (err) {
    next(err);
  }
};
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(createError(404, "Review not found!"));
    
    if (review.userId !== req.userId) {
      return next(createError(403, "You can only delete your own review!"));
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    // Update the gig's star rating
    await Gig.findByIdAndUpdate(review.gigId, {
      $inc: { totalStars: -review.star, starNumber: -1 },
    });
    
    res.status(200).send("Review has been deleted!");
  } catch (err) {
    next(err);
  }
};
