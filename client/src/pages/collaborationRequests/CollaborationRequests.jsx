import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import moment from "moment";
import newRequest from "../../utils/newRequest";
import "./CollaborationRequests.scss";

const CollaborationRequests = () => {
  const [activeTab, setActiveTab] = useState("received");
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Fetch collaborations created by the user (to see received applications)
  const { 
    isLoading: isLoadingCreated, 
    error: errorCreated, 
    data: createdCollaborations 
  } = useQuery({
    queryKey: ["userCreatedCollaborations"],
    queryFn: () => 
      newRequest.get(`/collaborations?userId=${currentUser._id}`).then((res) => res.data),
  });

  // Fetch collaborations where the user has applied
  const { 
    isLoading: isLoadingApplied, 
    error: errorApplied, 
    data: appliedCollaborations 
  } = useQuery({
    queryKey: ["userApplications"],
    queryFn: () => 
      newRequest.get("/collaborations/applications").then((res) => res.data),
  });

  // Mutation for updating application status
  const updateStatusMutation = useMutation({
    mutationFn: ({ collaborationId, applicationId, status }) => {
      return newRequest.put(`/collaborations/application/${collaborationId}`, {
        applicationId,
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userCreatedCollaborations"]);
      queryClient.invalidateQueries(["communities"]); // Invalidate communities cache
    },
  });

  const handleStatusUpdate = (collaborationId, applicationId, status) => {
    updateStatusMutation.mutate({ collaborationId, applicationId, status });
  };

  const renderReceivedApplications = () => {
    if (isLoadingCreated) return <div className="loading">Loading your collaborations...</div>;
    if (errorCreated) return <div className="error">Error: {errorCreated.message}</div>;
    
    if (!createdCollaborations || createdCollaborations.length === 0) {
      return <div className="empty-state">You haven't created any collaborations yet.</div>;
    }

    return (
      <div className="collaborations-list">
        {createdCollaborations.map((collab) => (
          <div key={collab._id} className="collaboration-item">
            <div className="collab-header">
              <h3>
                <Link to={`/collaborate/${collab._id}`}>{collab.title}</Link>
              </h3>
              <span className={`mode ${collab.mode.toLowerCase()}`}>{collab.mode}</span>
            </div>
            
            <div className="applications-section">
              <h4>Applications ({collab.applicants?.length || 0})</h4>
              
              {collab.applicants && collab.applicants.length > 0 ? (
                <div className="applications-list">
                  {collab.applicants.map((app) => (
                    <div key={app._id} className={`application-item ${app.status}`}>
                      <div className="applicant-info">
                        <div className="applicant-header">
                          <span className="applicant-name">
                            {app.userId?.username || "User"}
                          </span>
                          <span className="applied-date">
                            Applied {moment(app.appliedAt).fromNow()}
                          </span>
                        </div>
                        
                        <span className="role-applied">Role: {app.roleApplied}</span>
                        <span className="status">Status: {app.status}</span>
                        
                        {app.message && (
                          <p className="message">"{app.message}"</p>
                        )}
                      </div>
                      
                      {app.status === "pending" && (
                        <div className="action-buttons">
                          <button 
                            className="accept-btn"
                            onClick={() => handleStatusUpdate(collab._id, app._id, "accepted")}
                            disabled={updateStatusMutation.isLoading}
                          >
                            Accept
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => handleStatusUpdate(collab._id, app._id, "rejected")}
                            disabled={updateStatusMutation.isLoading}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-applications">No applications received yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMyApplications = () => {
    if (isLoadingApplied) return <div className="loading">Loading your applications...</div>;
    if (errorApplied) return <div className="error">Error: {errorApplied.message}</div>;
    
    if (!appliedCollaborations || appliedCollaborations.length === 0) {
      return <div className="empty-state">You haven't applied to any collaborations yet.</div>;
    }

    return (
      <div className="collaborations-list">
        {appliedCollaborations.map((collab) => (
          <div key={collab._id} className="collaboration-item">
            <div className="collab-header">
              <h3>
                <Link to={`/collaborate/${collab._id}`}>{collab.title}</Link>
              </h3>
              <span className={`mode ${collab.mode.toLowerCase()}`}>{collab.mode}</span>
            </div>
            
            <div className="application-details">
              <div className={`status-badge ${collab.applicationStatus}`}>
                {collab.applicationStatus}
              </div>
              
              <div className="application-info">
                <p><strong>Role Applied:</strong> {collab.roleApplied}</p>
                <p><strong>Applied:</strong> {moment(collab.appliedAt).format("MMMM D, YYYY")}</p>
                <p><strong>Created by:</strong> {collab.createdBy?.username || "Unknown"}</p>
              </div>
              
              <Link to={`/collaborate/${collab._id}`} className="view-btn">
                View Collaboration
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="collaboration-requests">
      <div className="container">
        <h1>Collaboration Requests</h1>
        
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === "received" ? "active" : ""}`}
            onClick={() => setActiveTab("received")}
          >
            Received Applications
          </button>
          <button 
            className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            My Applications
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === "received" ? renderReceivedApplications() : renderMyApplications()}
        </div>
      </div>
    </div>
  );
};

export default CollaborationRequests;