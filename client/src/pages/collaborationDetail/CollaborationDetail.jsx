import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import newRequest from "../../utils/newRequest";
import "./CollaborationDetail.scss";

const CollaborationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  const [selectedRole, setSelectedRole] = useState("");
  const [message, setMessage] = useState("");
  const [applicationStatus, setApplicationStatus] = useState({});

  // Fetch collaboration details
  const { isLoading, error, data: collaboration } = useQuery({
    queryKey: ["collaboration", id],
    queryFn: () => newRequest.get(`/collaborations/single/${id}`).then((res) => res.data),
  });

  // Fetch creator info
  const { data: creatorData } = useQuery({
    queryKey: ["user", collaboration?.createdBy],
    queryFn: () => newRequest.get(`/users/${collaboration?.createdBy}`).then((res) => res.data),
    enabled: !!collaboration?.createdBy,
  });

  // Apply for a role
  const applyMutation = useMutation({
    mutationFn: (applicationData) => {
      return newRequest.post(`/collaborations/${id}/apply`, applicationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["collaboration", id]);
      setSelectedRole("");
      setMessage("");
      alert("Application submitted successfully!");
    },
  });

  // Update application status
  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }) => {
      return newRequest.put(`/collaborations/application/${applicationId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["collaboration", id]);
      setApplicationStatus({});
    },
  });

  const handleApply = (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    applyMutation.mutate({
      roleApplied: selectedRole,
      message: message
    });
  };

  const handleStatusUpdate = (applicationId, status) => {
    updateStatusMutation.mutate({ applicationId, status });
  };

  if (isLoading) return <div className="loading">Loading collaboration details...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const isCreator = currentUser?._id === collaboration.createdBy;
  const hasApplied = collaboration.applicants.some(app => app.userId === currentUser?._id);
  
  // Calculate available positions
  const totalPositions = collaboration.positions.reduce(
    (sum, position) => sum + position.count, 0
  );
  
  const filledPositions = collaboration.positions.reduce(
    (sum, position) => sum + (position.filled || 0), 0
  );

  return (
    <div className="collaboration-detail">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/collaborate">Collaborations</Link> / {collaboration.title}
        </div>
        
        <div className="header">
          <div className="title-section">
            <h1>{collaboration.title}</h1>
            <span className={`mode ${collaboration.mode.toLowerCase()}`}>
              {collaboration.mode}
            </span>
          </div>
          
          <div className="meta-info">
            <span className="date">Posted {moment(collaboration.createdAt).fromNow()}</span>
            <span className="deadline">Deadline: {moment(collaboration.deadline).format("MMM DD, YYYY")}</span>
          </div>
        </div>
        
        <div className="content-wrapper">
          <div className="main-content">
            <div className="description">
              <h3>Description</h3>
              <p>{collaboration.description}</p>
            </div>
            
            <div className="skills">
              <h3>Skills Required</h3>
              <div className="skill-tags">
                {collaboration.skillsRequired.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            
            <div className="positions">
              <h3>Positions ({filledPositions}/{totalPositions} filled)</h3>
              <div className="positions-list">
                {collaboration.positions.map((position, index) => (
                  <div key={index} className="position-item">
                    <div className="position-info">
                      <span className="role">{position.role}</span>
                      <span className="count">{position.filled || 0}/{position.count} filled</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ width: `${((position.filled || 0) / position.count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {isCreator && (
              <div className="applications">
                <h3>Applications</h3>
                {collaboration.applicants.length === 0 ? (
                  <p>No applications yet.</p>
                ) : (
                  <div className="applications-list">
                    {collaboration.applicants.map((app, index) => (
                      <div key={index} className={`application-item ${app.status}`}>
                        <div className="applicant-info">
                          <span className="role-applied">Role: {app.roleApplied}</span>
                          <span className="status">Status: {app.status}</span>
                          {app.message && <p className="message">"{app.message}"</p>}
                        </div>
                        
                        {app.status === "pending" && (
                          <div className="action-buttons">
                            <button 
                              className="accept-btn"
                              onClick={() => handleStatusUpdate(app._id, "accepted")}
                            >
                              Accept
                            </button>
                            <button 
                              className="reject-btn"
                              onClick={() => handleStatusUpdate(app._id, "rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="sidebar">
            <div className="creator-card">
              <h3>Created by</h3>
              {creatorData && (
                <div className="creator-info">
                  <img src={creatorData.img || "/img/noavatar.jpg"} alt={creatorData.username} />
                  <Link to={`/profile/${creatorData._id}`}>{creatorData.username}</Link>
                </div>
              )}
            </div>
            
            {!isCreator && !hasApplied && (
              <div className="apply-card">
                <h3>Apply for a Role</h3>
                <form onSubmit={handleApply}>
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
                    rows={4}
                  />
                  
                  <button 
                    type="submit" 
                    className="apply-btn"
                    disabled={applyMutation.isLoading}
                  >
                    {applyMutation.isLoading ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              </div>
            )}
            
            {hasApplied && (
              <div className="applied-card">
                <h3>You have applied</h3>
                <p>Your application is being reviewed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationDetail;