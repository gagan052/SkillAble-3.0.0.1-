import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Collaborate.scss";
import CollaborationCard from "../../components/collaborationCard/CollaborationCard";
import CollaborationForm from "../../components/collaborationForm/CollaborationForm";

const Collaborate = () => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("");
  const [mode, setMode] = useState("");

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["collaborations", filter, mode],
    queryFn: () =>
      newRequest
        .get(
          `/collaborations?${filter ? `search=${filter}` : ""}${
            mode ? `&mode=${mode}` : ""
          }`
        )
        .then((res) => res.data),
  });

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    refetch();
  };

  return (
    <div className="collaborate">
      <div className="container">
        <div className="header">
          <div className="header-top">
            <Link to="/collaboration-requests" className="requests-button">
              View Collaboration Requests
            </Link>
          </div>
          <h1>Collaborate with other freelancers</h1>
          <p>
            Find projects to collaborate on or create your own collaboration
            opportunity
          </p>
          <button className="create-button" onClick={toggleForm}>
            {showForm ? "Cancel" : "Create Collaboration"}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <CollaborationForm onSuccess={handleFormSuccess} />
          </div>
        )}

        <div className="filters">
          <div className="search">
            <input
              type="text"
              placeholder="Search collaborations..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="mode-filter">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div className="collaborations">
          {isLoading ? (
            <p>Loading collaborations...</p>
          ) : error ? (
            <p>Something went wrong! {error.message}</p>
          ) : data.length === 0 ? (
            <div className="no-results">
              <h2>No collaborations found</h2>
              <p>Be the first to create a collaboration opportunity!</p>
            </div>
          ) : (
            <div className="collaboration-cards">
              {data.map((collaboration) => (
                <CollaborationCard
                  key={collaboration._id}
                  collaboration={collaboration}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collaborate;