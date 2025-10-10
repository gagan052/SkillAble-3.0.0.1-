import Collaboration from "../models/collaboration.model.js";
import createError from "../utils/createError.js";

// Create a new collaboration
export const createCollaboration = async (req, res, next) => {
  try {
    const newCollaboration = new Collaboration({
      ...req.body,
      createdBy: req.userId,
    });
    
    const savedCollaboration = await newCollaboration.save();
    res.status(201).json(savedCollaboration);
  } catch (err) {
    next(err);
  }
};

// Get all collaborations with optional filters
export const getCollaborations = async (req, res, next) => {
  const q = req.query;
  const filters = {
    ...(q.search && { title: { $regex: q.search, $options: "i" } }),
    ...(q.skills && { skillsRequired: { $in: q.skills.split(",") } }),
    ...(q.mode && { mode: q.mode }),
    ...(q.userId && { createdBy: q.userId }),
    ...(q.isActive !== undefined && { isActive: q.isActive === "true" }),
  };

  try {
    const collaborations = await Collaboration.find(filters)
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
    }
    
    // If un-accepting (changing from accepted to rejected), decrease the filled count
    if (status === "rejected" && application.status === "accepted") {
      const rolePosition = collaboration.positions.find(
        pos => pos.role === application.roleApplied
      );
      
      rolePosition.filled = Math.max(0, rolePosition.filled - 1);
    }
    
    // Update application status
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