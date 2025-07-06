import Gig from "../models/gig.model.js";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";

export const createGig = async (req, res, next) => {
  if (!req.isSeller)
    return next(createError(403, "Only sellers can create a gig!"));

  const newGig = new Gig({
    userId: req.userId,
    ...req.body,
  });

  try {
    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (err) {
    next(err);
  }
};
export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return next(createError(404, "Gig not found!"));
    
    if (gig.userId !== req.userId)
      return next(createError(403, "You can delete only your gig!"));

    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).send("Gig has been deleted!");
  } catch (err) {
    next(err);
  }
};
export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return next(createError(404, "Gig not found!"));
    res.status(200).send(gig);
  } catch (err) {
    next(err);
  }
};
export const getGigs = async (req, res, next) => {
  const q = req.query;
  const filters = {
    ...(q.userId && { userId: q.userId }),
    ...(q.cat && { cat: q.cat }),
    ...((q.min || q.max) && {
      price: {
        ...(q.min && { $gt: q.min }),
        ...(q.max && { $lt: q.max }),
      },
    }),
    ...(q.search && { title: { $regex: q.search, $options: "i" } }),
  };

  // Pagination parameters
  const page = parseInt(q.page) || 0;
  const limit = parseInt(q.limit) || 10;
  const skip = page * limit;

  try {
    const gigs = await Gig.find(filters)
      .sort({ [q.sort || "createdAt"]: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Gig.countDocuments(filters);

    res.status(200).json({
      gigs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

export const getRecommendedGigs = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { excludeId } = req.query; // To exclude the current gig
    
    console.log("Recommendation request:", { category, excludeId });
    
    if (!category) {
      return next(createError(400, "Category is required"));
    }
    
    // Build the filter to find gigs from the same category
    // Use case-insensitive search and handle different category formats
    const filter = {
      $or: [
        { cat: category },
        { cat: category.toLowerCase() },
        { cat: category.toUpperCase() },
        { cat: category.replace(/_/g, ' ') },
        { cat: category.replace(/\s+/g, '_') }
      ]
    };
    
    // Exclude the current gig if excludeId is provided
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    
    console.log("Filter being applied:", JSON.stringify(filter, null, 2));
    
    // First, let's check what categories exist in the database
    const allCategories = await Gig.distinct('cat');
    console.log("Available categories in database:", allCategories);
    
    // Get recommended gigs, sorted by rating and sales
    const recommendedGigs = await Gig.find(filter)
      .sort({ 
        totalStars: -1, 
        sales: -1, 
        createdAt: -1 
      })
      .limit(8) // Limit to 8 recommendations
      .select('_id title desc price cover totalStars starNumber shortTitle shortDesc deliveryTime revisionNumber features sales userId cat');
    
    console.log(`Found ${recommendedGigs.length} recommended gigs for category: ${category}`);
    
    // If no gigs found with exact category match, try a broader search
    if (recommendedGigs.length === 0) {
      console.log("No exact category match found, trying broader search...");
      
      // Try to find gigs with similar category names
      const broaderFilter = {
        $or: [
          { cat: { $regex: category, $options: 'i' } },
          { cat: { $regex: category.replace(/_/g, ' '), $options: 'i' } },
          { cat: { $regex: category.replace(/\s+/g, '_'), $options: 'i' } }
        ]
      };
      
      if (excludeId) {
        broaderFilter._id = { $ne: excludeId };
      }
      
      const broaderResults = await Gig.find(broaderFilter)
        .sort({ 
          totalStars: -1, 
          sales: -1, 
          createdAt: -1 
        })
        .limit(8)
        .select('_id title desc price cover totalStars starNumber shortTitle shortDesc deliveryTime revisionNumber features sales userId cat');
      
      console.log(`Found ${broaderResults.length} gigs with broader search`);
      
      if (broaderResults.length > 0) {
        return res.status(200).json(broaderResults);
      }
      
      // If still no results, get some random gigs from any category
      console.log("No category-specific gigs found, returning random gigs...");
      const randomFilter = excludeId ? { _id: { $ne: excludeId } } : {};
      
      const randomGigs = await Gig.find(randomFilter)
        .sort({ createdAt: -1 })
        .limit(8)
        .select('_id title desc price cover totalStars starNumber shortTitle shortDesc deliveryTime revisionNumber features sales userId cat');
      
      console.log(`Found ${randomGigs.length} random gigs`);
      return res.status(200).json(randomGigs);
    }
    
    res.status(200).json(recommendedGigs);
  } catch (err) {
    console.error("Error in getRecommendedGigs:", err);
    next(err);
  }
};

export const getGeneralRecommendations = async (req, res, next) => {
  try {
    const { excludeId } = req.query;
    
    console.log("General recommendations request:", { excludeId });
    
    // Build filter to exclude current gig if provided
    const filter = excludeId ? { _id: { $ne: excludeId } } : {};
    
    // Get random gigs, sorted by creation date and rating
    const generalGigs = await Gig.find(filter)
      .sort({ 
        createdAt: -1,
        totalStars: -1,
        sales: -1
      })
      .limit(8)
      .select('_id title desc price cover totalStars starNumber shortTitle shortDesc deliveryTime revisionNumber features sales userId cat');
    
    console.log(`Found ${generalGigs.length} general recommendations`);
    
    res.status(200).json(generalGigs);
  } catch (err) {
    console.error("Error in getGeneralRecommendations:", err);
    next(err);
  }
};