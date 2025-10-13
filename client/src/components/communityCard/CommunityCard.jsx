import React from "react";
import { Link } from "react-router-dom";
import "./CommunityCard.scss";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const CommunityCard = ({ community }) => {
  const { isLoading, data } = useQuery({
    queryKey: ["user", community.createdBy],
    queryFn: () =>
      newRequest.get(`/users/${community.createdBy}`).then((res) => res.data),
    enabled: !!community.createdBy,
  });

  return (
    <div className="community-card">
      <div className="card-header">
        {community.avatar ? (
          <img src={community.avatar} alt={community.name} className="community-avatar" />
        ) : (
          <div className="community-avatar-placeholder">
            {community.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h3>{community.name}</h3>
      </div>
      <div className="card-body">
        <p className="description">{community.description}</p>
        <div className="stats">
          <div className="stat">
            <span className="stat-value">{community.members.length}</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="stat">
            <span className="stat-value">{community.collaborations.length}</span>
            <span className="stat-label">Projects</span>
          </div>
        </div>
        {community.tags.length > 0 && (
          <div className="tags">
            {community.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {community.tags.length > 3 && (
              <span className="tag more">+{community.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
      <div className="card-footer">
        <div className="creator">
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <>
              <img
                src={data?.img || "/img/noavatar.jpg"}
                alt={data?.username}
                className="creator-img"
              />
              <span>Created by {data?.username}</span>
            </>
          )}
        </div>
        <Link to={`/community/${community._id}`} className="view-button">
          View Community
        </Link>
      </div>
    </div>
  );
};

export default CommunityCard;