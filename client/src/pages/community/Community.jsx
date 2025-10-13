import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Community.scss";
import CommunityCard from "../../components/communityCard/CommunityCard";
import CommunityForm from "../../components/communityForm/CommunityForm";

const Community = () => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("");
  const [showMyCommunitiesOnly, setShowMyCommunitiesOnly] = useState(false);

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["communities", filter, showMyCommunitiesOnly],
    queryFn: () =>
      newRequest
        .get(
          `/communities${showMyCommunitiesOnly ? "/my" : ""}?${filter ? `search=${filter}` : ""}`
        )
        .then((res) => res.data)
        .catch(err => {
          console.log("Community fetch error:", err);
          return []; // Return empty array on error to prevent UI breaking
        }),
    retry: false, // Don't retry on failure
  });

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    refetch();
  };

  return (
    <div className="community">
      <div className="container">
        <div className="header">
          <div className="header-top">
            <Link to="/collaboration-requests" className="requests-button">
              View Collaboration Requests
            </Link>
          </div>
          <h1>Join Communities and Collaborate</h1>
          <p>
            Connect with other freelancers in communities, create polls, and work together on projects
          </p>
          <button className="create-button" onClick={toggleForm}>
            {showForm ? "Cancel" : "Create Community"}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <CommunityForm onSuccess={handleFormSuccess} />
          </div>
        )}

        <div className="filters">
          <div className="search">
            <input
              type="text"
              placeholder="Search communities..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="my-communities-filter">
            <label>
              <input
                type="checkbox"
                checked={showMyCommunitiesOnly}
                onChange={() => setShowMyCommunitiesOnly(!showMyCommunitiesOnly)}
              />
              My Communities Only
            </label>
          </div>
        </div>

        <div className="communities">
          {isLoading ? (
            <p>Loading communities...</p>
          ) : error ? (
            <p>Something went wrong! {error.message}</p>
          ) : data?.length === 0 ? (
            <div className="no-results">
              <h2>No communities found</h2>
              <p>Be the first to create a community!</p>
            </div>
          ) : (
            <div className="community-cards">
              {data?.map((community) => (
                <CommunityCard
                  key={community._id}
                  community={community}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;