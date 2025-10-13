import Community from "../models/community.model.js";
import createError from "../utils/createError.js";

export const createCommunity = async (req, res, next) => {
  try {
    const newCommunity = new Community({
      ...req.body,
      createdBy: req.userId,
      members: [{ userId: req.userId, role: "admin" }]
    });
    
    const savedCommunity = await newCommunity.save();
    res.status(201).json(savedCommunity);
  } catch (err) {
    next(err);
  }
};

export const getCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({
      $or: [
        { isPublic: true },
        { "members.userId": req.userId }
      ]
    });
    res.status(200).json(communities);
  } catch (err) {
    next(err);
  }
};

export const getMyCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find({
      "members.userId": req.userId
    });
    res.status(200).json(communities);
  } catch (err) {
    next(err);
  }
};

export const createSubgroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const communityId = req.params.id;
    
    // Find the community
    const community = await Community.findById(communityId);
    if (!community) return next(createError(404, "Community not found"));
    
    // Check if user is a member with admin privileges
    const member = community.members.find(m => m.userId === req.userId);
    if (!member) return next(createError(403, "You are not a member of this community"));
    if (member.role !== "admin") return next(createError(403, "Only admins can create subgroups"));
    
    // Create the subgroup
    const newSubgroup = {
      name,
      description,
      createdBy: req.userId,
      members: [req.userId],
      messages: []
    };
    
    // Add the subgroup to the community
    community.subgroups.push(newSubgroup);
    await community.save();
    
    res.status(201).json(newSubgroup);
  } catch (err) {
    next(err);
  }
};

export const getCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return next(createError(404, "Community not found"));
    
    // Check if private community and user is not a member
    if (!community.isPublic && !community.members.some(member => member.userId === req.userId)) {
      return next(createError(403, "You don't have access to this community"));
    }
    
    res.status(200).json(community);
  } catch (err) {
    next(err);
  }
};

export const updateCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return next(createError(404, "Community not found"));
    
    // Check if user is admin
    const userMember = community.members.find(member => member.userId === req.userId);
    if (!userMember || userMember.role !== "admin") {
      return next(createError(403, "Only community admins can update community details"));
    }
    
    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.status(200).json(updatedCommunity);
  } catch (err) {
    next(err);
  }
};

export const joinCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return next(createError(404, "Community not found"));
    
    // Check if user is already a member
    if (community.members.some(member => member.userId === req.userId)) {
      return next(createError(400, "You are already a member of this community"));
    }
    
    // Check if community is private
    if (!community.isPublic) {
      return next(createError(403, "This community is private. You need an invitation to join"));
    }
    
    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      { $push: { members: { userId: req.userId, role: "member" } } },
      { new: true }
    );
    
    res.status(200).json(updatedCommunity);
  } catch (err) {
    next(err);
  }
};

export const leaveCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return next(createError(404, "Community not found"));
    
    // Check if user is a member
    if (!community.members.some(member => member.userId === req.userId)) {
      return next(createError(400, "You are not a member of this community"));
    }
    
    // Check if user is the only admin
    const isAdmin = community.members.find(member => member.userId === req.userId)?.role === "admin";
    const adminCount = community.members.filter(member => member.role === "admin").length;
    
    if (isAdmin && adminCount === 1) {
      return next(createError(400, "You are the only admin. Assign another admin before leaving"));
    }
    
    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: { userId: req.userId } } },
      { new: true }
    );
    
    res.status(200).json(updatedCommunity);
  } catch (err) {
    next(err);
  }
};

export const createPoll = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return next(createError(404, "Community not found"));
    
    // Check if user is a member
    if (!community.members.some(member => member.userId === req.userId)) {
      return next(createError(403, "Only community members can create polls"));
    }
    
    const poll = {
      ...req.body,
      createdAt: new Date(),
      status: "active"
    };
    
    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      { $push: { polls: poll } },
      { new: true }
    );
    
    res.status(201).json(updatedCommunity);
  } catch (err) {
    next(err);
  }
};

export const votePoll = async (req, res, next) => {
  try {
    const { pollId, optionIndex } = req.body;
    if (optionIndex === undefined) return next(createError(400, "Option index is required"));
    
    const community = await Community.findById(req.params.id);
    if (!community) return next(createError(404, "Community not found"));
    
    // Check if user is a member
    if (!community.members.some(member => member.userId === req.userId)) {
      return next(createError(403, "Only community members can vote in polls"));
    }
    
    const pollIndex = community.polls.findIndex(p => p._id.toString() === pollId);
    if (pollIndex === -1) return next(createError(404, "Poll not found"));
    
    const poll = community.polls[pollIndex];
    if (poll.status !== "active") return next(createError(400, "Poll is not active"));
    
    // Check if option exists
    if (!poll.options[optionIndex]) return next(createError(400, "Invalid option index"));
    
    // Check if user already voted
    const hasVoted = poll.options.some(option => option.voters.includes(req.userId));
    if (hasVoted) return next(createError(400, "You have already voted in this poll"));
    
    // Update the vote count and add user to voters
    community.polls[pollIndex].options[optionIndex].votes += 1;
    community.polls[pollIndex].options[optionIndex].voters.push(req.userId);
    
    await community.save();
    res.status(200).json(community);
  } catch (err) {
    next(err);
  }
};

export const addCollaboration = async (req, res, next) => {
  try {
    const { collaborationId, title } = req.body;
    if (!collaborationId || !title) return next(createError(400, "Collaboration ID and title are required"));
    
    const community = await Community.findById(req.params.id);
    if (!community) return next(createError(404, "Community not found"));
    
    // Check if user is a member with admin or moderator role
    const userMember = community.members.find(member => member.userId === req.userId);
    if (!userMember || (userMember.role !== "admin" && userMember.role !== "moderator")) {
      return next(createError(403, "Only admins or moderators can add collaborations"));
    }
    
    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          collaborations: { 
            collaborationId, 
            title, 
            status: "active" 
          } 
        } 
      },
      { new: true }
    );
    
    res.status(201).json(updatedCommunity);
  } catch (err) {
    next(err);
  }
};