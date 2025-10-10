import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import newRequest from "../../utils/newRequest";
import "./CollaborationCard.scss";

const CollaborationCard = ({ collaboration }) => {
  const navigate = useNavigate();
  const [isApplying, setIsApplying] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [message, setMessage] = useState("");
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  // Check if this is the user's own collaboration
  const isOwnCollaboration = currentUser && collaboration && 
                            collaboration.createdBy === currentUser._id;
                            
  // Check if user has already applied to this collaboration
  const hasApplied = currentUser && collaboration && 
                    collaboration.applicants && 
                    collaboration.applicants.some(app => 
                      app.userId === currentUser._id);
  
  // Safely check if createdBy is valid
  const isValidCreatedBy = collaboration && 
                          collaboration.createdBy && 
                          typeof collaboration.createdBy === 'string' && 
                          collaboration.createdBy.length > 0;
  
  // Fetch creator info with improved error handling
  const { isLoading: isLoadingUser, data: userData, error: userError } = useQuery({
    queryKey: ["user", isValidCreatedBy ? collaboration.createdBy : "invalid"],
    queryFn: () => {
      if (!isValidCreatedBy) {
        return Promise.resolve(null);
      }
      return newRequest.get(`/users/${collaboration.createdBy}`)
        .then((res) => res.data)
        .catch((error) => {
          console.log("Error fetching user data:", error);
          return null;
        });
    },
    enabled: isValidCreatedBy,
    retry: 1,
    retryDelay: 1000
  });

  // Calculate available positions
  const totalPositions = collaboration.positions.reduce(
    (sum, position) => sum + position.count,
    0
  );
  
  const filledPositions = collaboration.positions.reduce(
    (sum, position) => sum + (position.filled || 0),
    0
  );

  const handleApply = async (e) => {
    e.preventDefault();
    
    // Prevent applying to own collaboration
    if (isOwnCollaboration) {
      alert("You cannot apply to your own collaboration.");
      setIsApplying(false);
      return;
    }
    
    try {
      await newRequest.post(`/collaborations/apply/${collaboration._id}`, {
        roleApplied: selectedRole,
        message: message
      });
      
      setIsApplying(false);
      setSelectedRole("");
      setMessage("");
      alert("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      // Handle specific error cases
      if (err.response?.status === 403 && err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to submit application. " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="collaboration-card">
      <div className="card-header">
        <span className={`mode ${collaboration.mode.toLowerCase()}`}>
          {collaboration.mode}
        </span>
        <span className="date">
          Posted {moment(collaboration.createdAt).fromNow()}
        </span>
      </div>
      
      <Link to={`/collaborate/${collaboration._id}`} className="title-link">
        <h2>{collaboration.title}</h2>
      </Link>
      
      <p className="description">
        {collaboration.description.substring(0, 100)}
        {collaboration.description.length > 100 ? "..." : ""}
      </p>
      
      <div className="skills">
        <h4>Skills Required:</h4>
        <div className="skill-tags">
          {collaboration.skillsRequired.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="positions">
        <h4>Positions ({filledPositions}/{totalPositions} filled):</h4>
        <ul>
          {collaboration.positions.map((position, index) => (
            <li key={index}>
              {position.role}: {position.filled || 0}/{position.count} filled
            </li>
          ))}
        </ul>
      </div>
      
      <div className="creator">
        {isLoadingUser ? (
          <p>Loading creator info...</p>
        ) : userData ? (
          <>
            <img 
              src={userData.img || "/img/noavatar.jpg"} 
              alt={userData.username} 
            />
            <span>Created by <Link to={`/profile/${userData._id}`}>{userData.username}</Link></span>
          </>
        ) : (
          <p>Creator information unavailable</p>
        )}
      </div>
      
      {isOwnCollaboration ? (
        <button 
          className="apply-button disabled"
          disabled
          title="You cannot apply to your own collaboration"
        >
          Your Collaboration
        </button>
      ) : hasApplied ? (
        <button 
          className="apply-button applied"
          disabled
          title="You have already applied to this collaboration"
        >
          Applied
        </button>
      ) : !isApplying ? (
        <button 
          className="apply-button"
          onClick={() => setIsApplying(true)}
        >
          Apply for Role
        </button>
      ) : (
        <form className="apply-form" onSubmit={handleApply}>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            required
          >
            <option value="">Select a role</option>
            {collaboration.positions.map((position, index) => (
              position.filled < position.count && (
                <option key={index} value={position.role}>
                  {position.role}
                </option>
              )
            ))}
          </select>
          
          <textarea
            placeholder="Why are you a good fit for this role? (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          
          <div className="form-actions">
            <button type="submit" className="submit-button">
              Submit Application
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setIsApplying(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CollaborationCard;