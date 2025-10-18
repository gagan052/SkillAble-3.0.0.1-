import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { Link } from "react-router-dom";
import "./CommunityDetail.scss";

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();

  const [showSubgroupForm, setShowSubgroupForm] = useState(false);
  const [subgroupName, setSubgroupName] = useState("");
  const [subgroupDescription, setSubgroupDescription] = useState("");
  const [selectedSubgroup, setSelectedSubgroup] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  
  const handleCreateCollaboration = () => {
    navigate(`/add?communityId=${id}&isForCommunity=true`);
  };
  
  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedSubgroup) return;
    
    // For now, just show a placeholder message since backend isn't implemented
    alert("Chat functionality will be implemented in the next phase");
    setChatMessage("");
  };
  
  // Fetch community details
  const { isLoading, error, data: community } = useQuery({
    queryKey: ["community", id],
    queryFn: () => newRequest.get(`/communities/${id}`).then((res) => res.data).catch(err => {
      console.log("Community detail fetch error:", err);
      return null; // Return null on error
    }),
    retry: false, // Don't retry on failure
  });

  // Join community mutation
  const joinMutation = useMutation({
    mutationFn: () => newRequest.post(`/communities/${id}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries(["community", id]);
    },
  });

  const handleJoinCommunity = () => {
    joinMutation.mutate();
  };
  
  // Create subgroup mutation
  const createSubgroupMutation = useMutation({
    mutationFn: (subgroupData) => {
      return newRequest.post(`/communities/${id}/subgroups`, subgroupData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["community", id]);
      setShowSubgroupForm(false);
      setSubgroupName("");
      setSubgroupDescription("");
      // Show success message
      alert("Subgroup created successfully!");
    },
    onError: (error) => {
      console.error("Error creating subgroup:", error);
      alert("Failed to create subgroup. Please try again.");
    }
  });
  
  const handleCreateSubgroup = (e) => {
    e.preventDefault();
    if (!subgroupName.trim()) return;
    
    createSubgroupMutation.mutate({
      name: subgroupName,
      description: subgroupDescription
    });
  };

  // Check if user is a member, admin, or owner
  const isMember = community?.members.some(member => member.userId === currentUser?._id);
  const isAdmin = community?.members.some(member => member.userId === currentUser?._id && member.role === "admin");
  const isOwner = community?.createdBy === currentUser?._id;
  
  if (isLoading) return <div className="loading">Loading community details...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;
  if (!community) return <div className="error">Community not found</div>;

  // Mock subgroups data (will be replaced with actual API data)
  const subgroups = community.subgroups || [];

  return (
    <div className="community-detail">
      <div className="container">
        <div className="header">
          <div className="community-info">
            {community.avatar ? (
              <img src={community.avatar} alt={community.name} className="community-avatar" />
            ) : (
              <div className="community-avatar-placeholder">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="community-text">
              <h1>{community.name}</h1>
              <p className="description">{community.description}</p>
              <div className="tags">
                {community.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            {!isMember && (
              <button
                  className="join-button"
                  onClick={handleJoinCommunity}
                  disabled={joinMutation.isLoading}
                >
                  {joinMutation.isLoading ? "Joining..." : "Join Community"}
                </button>
            )}
            
            {isOwner && (
              <button 
                className="create-collab-button" 
                onClick={handleCreateCollaboration}
              >
                Create Collaboration
              </button>
            )}
          </div>
        </div>
        
        <div className="community-content">
          <div className="sidebar">
            <div className="members-section">
              <div className="section-header">
                <h3>Members ({community.members.length})</h3>
                {isOwner && (
                  <button className="small-button">Invite</button>
                )}
              </div>
              <div className="members-list">
                {community.members.slice(0, 5).map((member) => (
                  <div key={member.userId} className="member-item">
                    <img src="/img/noavatar.jpg" alt="" className="member-img" />
                    <span>{member.role === "admin" ? "👑 Admin" : "Member"}</span>
                  </div>
                ))}
                {community.members.length > 5 && (
                  <div className="more-members">+{community.members.length - 5} more</div>
                )}
              </div>
            </div>
            
            <div className="collaborations-section">
              <div className="section-header">
                <h3>Collaborations ({community.collaborations.length})</h3>
                {isOwner && (
                  <button 
                    className="small-button"
                    onClick={handleCreateCollaboration}
                  >
                    Create
                  </button>
                )}
              </div>
              
              {community.collaborations.length === 0 ? (
                <p className="no-items">No collaborations yet</p>
              ) : (
                <div className="collaborations-list">
                  {community.collaborations.map((collab) => (
                    <Link 
                      key={collab.collaborationId} 
                      to={`/collaborate/${collab.collaborationId}`}
                      className="collaboration-item"
                    >
                      {collab.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="main-content">
            <div className="subgroups-section">
              <div className="section-header">
                <h3>Sub-groups</h3>
                {isAdmin && (
                  <button 
                    className="small-button" 
                    onClick={() => setShowSubgroupForm(!showSubgroupForm)}
                  >
                    {showSubgroupForm ? "Cancel" : "Create Sub-group"}
                  </button>
                )}
              </div>
              
              {showSubgroupForm && (
                  <div className="subgroup-form">
                    <form onSubmit={handleCreateSubgroup}>
                      <div className="form-group">
                        <label>Name</label>
                        <input 
                          type="text" 
                          value={subgroupName} 
                          onChange={(e) => setSubgroupName(e.target.value)} 
                          placeholder="Enter sub-group name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea 
                          value={subgroupDescription} 
                          onChange={(e) => setSubgroupDescription(e.target.value)} 
                          placeholder="Enter sub-group description"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="submit-button"
                        disabled={createSubgroupMutation.isLoading}
                      >
                        {createSubgroupMutation.isLoading ? "Creating..." : "Create Sub-group"}
                      </button>
                    </form>
                  </div>
                )}
              
              {community?.subgroups && community.subgroups.length > 0 ? (
                  <div className="subgroups-list">
                    {community.subgroups.map((subgroup) => (
                      <div 
                        key={subgroup._id} 
                        className={`subgroup-item ${selectedSubgroup?._id === subgroup._id ? 'active' : ''}`}
                        onClick={() => setSelectedSubgroup(subgroup)}
                      >
                        <h4>{subgroup.name}</h4>
                        {subgroup.description && <p>{subgroup.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-subgroups">
                    <p>No sub-groups yet. {isAdmin ? "Create one to start chatting!" : ""}</p>
                  </div>
                )}
              
              {selectedSubgroup && (
                <div className="subgroup-chat">
                  <div className="chat-header">
                    <h4>{selectedSubgroup.name}</h4>
                  </div>
                  <div className="chat-messages">
                    <p className="no-messages">No messages yet. Start the conversation!</p>
                  </div>
                  <div className="chat-input">
                      <input 
                        type="text" 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type your message..." 
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;