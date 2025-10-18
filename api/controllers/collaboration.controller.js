import Collaboration from "../models/collaboration.model.js";
import createError from "../utils/createError.js";
import mongoose from "mongoose";

// Create a new collaboration
export const createCollaboration = async (req, res, next) => {
  try {
    const { expiresAt, ...otherBody } = req.body;
    const newCollaboration = new Collaboration({
      ...otherBody,
      createdBy: req.userId,
      ...(expiresAt && { expiresAt: new Date(expiresAt) }),
    });
    
    const savedCollaboration = await newCollaboration.save();
    res.status(201).json(savedCollaboration);
  } catch (err) {
    next(err);
  }
};

// Get all collaborations with optional filters
export const getCollaborations = async (req, res, next) => {
  console.log("req.userId in getCollaborations:", req.userId);
  const q = req.query;
  const filters = {
    ...(q.search && { title: { $regex: q.search, $options: "i" } }),
    ...(q.skills && { skillsRequired: { $in: q.skills.split(",") } }),
    ...(q.mode && { mode: q.mode }),
    ...(q.userId && { createdBy: q.userId }),
    isActive: q.isActive === "false" ? false : true, // Default to true, unless explicitly set to "false"
  };

  // Add a filter to exclude collaborations where the user has an accepted application
  const userAcceptedFilter = req.userId ? {
    "applicants": { $not: { $elemMatch: { userId: req.userId, status: "accepted" } } }
  } : {};

  try {
    const collaborations = await Collaboration.find({ ...filters, ...userAcceptedFilter })
      .sort({ createdAt: -1 })
      .populate("createdBy", "username img");
    
    res.status(200).json(collaborations);
  } catch (err) {
    next(err);
  }
};

// Get a single collaboration by ID
export const getCollaboration = async (req, res, next) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id)
      .populate("createdBy", "username img")
      .populate("applicants.userId", "username img");
    
    if (!collaboration) return next(createError(404, "Collaboration not found"));
    
    res.status(200).json(collaboration);
  } catch (err) {
    next(err);
  }
};

// Update a collaboration (only by creator)
export const updateCollaboration = async (req, res, next) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) return next(createError(404, "Collaboration not found"));
    
    if (collaboration.createdBy.toString() !== req.userId) {
      return next(createError(403, "You can only update your own collaborations"));
    }
    
    const updatedCollaboration = await Collaboration.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.status(200).json(updatedCollaboration);
  } catch (err) {
    next(err);
  }
};

// Delete a collaboration (only by creator)
export const deleteCollaboration = async (req, res, next) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) return next(createError(404, "Collaboration not found"));
    
    if (collaboration.createdBy.toString() !== req.userId) {
      return next(createError(403, "You can only delete your own collaborations"));
    }
    
    await Collaboration.findByIdAndDelete(req.params.id);
    res.status(200).send("Collaboration has been deleted");
  } catch (err) {
    next(err);
  }
};

// Apply for a role in a collaboration
export const applyForCollaboration = async (req, res, next) => {
  try {
    const { roleApplied, message } = req.body;
    if (!roleApplied) return next(createError(400, "Role is required"));
    
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) return next(createError(404, "Collaboration not found"));
    
    // Check if user is the creator
    if (collaboration.createdBy.toString() === req.userId) {
      return next(createError(403, "You cannot apply to your own collaboration"));
    }
    
    // Check if the role exists
    const roleExists = collaboration.positions.some(pos => pos.role === roleApplied);
    if (!roleExists) return next(createError(400, "Selected role does not exist"));
    
    // Check if user already applied
    const alreadyApplied = collaboration.applicants.some(
      app => app.userId.toString() === req.userId
    );
    
    if (alreadyApplied) {
      return next(createError(400, "You have already applied to this collaboration"));
    }
    
    // Add application
    collaboration.applicants.push({
      userId: req.userId,
      roleApplied,
      message: message || "",
      status: "pending",
    });
    
    await collaboration.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (err) {
    next(err);
  }
};

// Update application status (accept/reject)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId, status } = req.body;
    if (!applicationId || !status) {
      return next(createError(400, "Application ID and status are required"));
    }
    
    if (!["accepted", "rejected"].includes(status)) {
      return next(createError(400, "Status must be 'accepted' or 'rejected'"));
    }
    
    const collaboration = await Collaboration.findById(req.params.id);
    if (!collaboration) return next(createError(404, "Collaboration not found"));
    
    // Check if user is the creator
    if (collaboration.createdBy.toString() !== req.userId) {
      return next(createError(403, "Only the creator can update application status"));
    }
    
    // Find the application
    const application = collaboration.applicants.id(applicationId);
    if (!application) return next(createError(404, "Application not found"));
    
    // If accepting, update the filled count for the role
    if (status === "accepted" && application.status !== "accepted") {
      const rolePosition = collaboration.positions.find(
        pos => pos.role === application.roleApplied
      );
      
      if (rolePosition.filled >= rolePosition.count) {
        return next(createError(400, "All positions for this role are already filled"));
      }
      
      rolePosition.filled += 1;

      // Check if all positions are filled
      const allPositionsFilled = collaboration.positions.every(
        (pos) => pos.filled >= pos.count
      );

      if (allPositionsFilled) {
        collaboration.isActive = false;
      }
      
      // If this collaboration is for a community, automatically add the user to the community
      if (collaboration.communityId) {
        const Community = mongoose.model('Community');
        try {
          const community = await Community.findById(collaboration.communityId);
          
          if (community) {
            // Check if user is already a member
            const isMember = community.members.some(member => 
              member.userId.toString() === application.userId.toString()
            );
            
            if (!isMember) {
              community.members.push({ 
                userId: application.userId, 
                role: "member" // Using valid enum value "member" instead of the role applied
              });
              await community.save();
            }
          } else {
            console.log("Community not found for collaborationId: ", collaboration.communityId);
          }
        } catch (communityErr) {
          console.error("Error adding user to community: ", communityErr);
          // Continue with collaboration update even if community update fails
        }
      }
    }

    application.status = status;
    await collaboration.save();
    res.status(200).json({ message: `Application ${status} successfully` });
  } catch (err) {
    next(err);
  }
};

// Get collaborations where user has applied
export const getUserApplications = async (req, res, next) => {
  try {
    const collaborations = await Collaboration.find({
      "applicants.userId": req.userId,
    })
      .populate("createdBy", "username img")
      .sort({ createdAt: -1 });
    
    // Format the response to include application status
    const formattedCollaborations = collaborations.map(collab => {
      const application = collab.applicants.find(
        app => app.userId.toString() === req.userId
      );
      
      return {
        ...collab._doc,
        applicationStatus: application.status,
        applicationId: application._id,
        roleApplied: application.roleApplied,
      };
    });
    
    res.status(200).json(formattedCollaborations);
  } catch (err) {
    next(err);
  }
};

// Delete expired collaborations and fulfilled collaborations
export const deleteExpiredCollaborations = async () => {
  try {
    const now = new Date();
    
    // Delete collaborations that have expired
    const expiredResult = await Collaboration.deleteMany({ expiresAt: { $lt: now } });
    console.log(`Deleted ${expiredResult.deletedCount} expired collaborations.`);
    
    // Delete collaborations where deadline has passed
    const deadlineResult = await Collaboration.deleteMany({ deadline: { $lt: now } });
    console.log(`Deleted ${deadlineResult.deletedCount} collaborations with passed deadlines.`);
    
    // Find collaborations where all positions are filled
    const collaborations = await Collaboration.find({});
    let fulfilledCount = 0;
    
    for (const collab of collaborations) {
      // Check if all positions are filled
      const allPositionsFilled = collab.positions.every(position => position.filled >= position.count);
      
      if (allPositionsFilled) {
        await Collaboration.findByIdAndDelete(collab._id);
        fulfilledCount++;
      }
    }
    
    console.log(`Deleted ${fulfilledCount} collaborations with all positions filled.`);
  } catch (err) {
    console.error("Error deleting expired/fulfilled collaborations:", err);
  }
};