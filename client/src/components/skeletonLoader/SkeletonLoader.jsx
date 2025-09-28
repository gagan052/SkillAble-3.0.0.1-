import React from "react";
import "./SkeletonLoader.scss";

// Base skeleton component
export const Skeleton = ({ width, height, borderRadius, className }) => {
  return (
    <div 
      className={`skeleton-pulse ${className || ""}`}
      style={{ 
        width: width || "100%", 
        height: height || "20px",
        borderRadius: borderRadius || "4px"
      }}
    ></div>
  );
};

// Skeleton for text lines
export const SkeletonText = ({ lines = 1, width = "100%", height = "16px", spacing = "10px" }) => {
  return (
    <div className="skeleton-text">
      {Array(lines).fill().map((_, i) => (
        <Skeleton 
          key={i} 
          width={typeof width === 'function' ? width(i) : width}
          height={height}
          className="skeleton-text-line"
          style={{ marginBottom: i < lines - 1 ? spacing : 0 }}
        />
      ))}
    </div>
  );
};

// Skeleton for cards (like gig cards)
export const SkeletonCard = ({ height = "300px" }) => {
  return (
    <div className="skeleton-card" style={{ height }}>
      <Skeleton height="60%" className="skeleton-card-image" />
      <div className="skeleton-card-content">
        <Skeleton width="40%" height="20px" className="skeleton-card-title" />
        <Skeleton width="70%" height="16px" className="skeleton-card-subtitle" />
        <Skeleton width="100%" height="16px" className="skeleton-card-text" />
        <div className="skeleton-card-footer">
          <Skeleton width="30%" height="16px" />
          <Skeleton width="20%" height="16px" />
        </div>
      </div>
    </div>
  );
};

// Skeleton for profile/avatar
export const SkeletonAvatar = ({ size = "40px" }) => {
  return (
    <Skeleton 
      width={size} 
      height={size} 
      borderRadius="50%" 
      className="skeleton-avatar"
    />
  );
};

// Skeleton for message/conversation item
export const SkeletonMessage = () => {
  return (
    <div className="skeleton-message">
      <SkeletonAvatar size="40px" />
      <div className="skeleton-message-content">
        <Skeleton width="40%" height="16px" className="skeleton-message-sender" />
        <Skeleton width="70%" height="14px" className="skeleton-message-preview" />
      </div>
      <Skeleton width="60px" height="14px" className="skeleton-message-time" />
    </div>
  );
};

// Skeleton for order item
export const SkeletonOrder = () => {
  return (
    <div className="skeleton-order">
      <div className="skeleton-order-header">
        <Skeleton width="30%" height="18px" />
        <Skeleton width="20%" height="18px" />
      </div>
      <div className="skeleton-order-body">
        <Skeleton width="100%" height="16px" />
        <Skeleton width="80%" height="16px" />
      </div>
      <div className="skeleton-order-footer">
        <Skeleton width="40%" height="16px" />
        <Skeleton width="15%" height="30px" borderRadius="4px" />
      </div>
    </div>
  );
};

// Skeleton for gig details
export const SkeletonGigDetail = () => {
  return (
    <div className="skeleton-gig-detail">
      <div className="skeleton-gig-header">
        <Skeleton width="70%" height="24px" className="skeleton-gig-title" />
        <div className="skeleton-seller-info">
          <SkeletonAvatar size="50px" />
          <div>
            <Skeleton width="120px" height="18px" />
            <Skeleton width="80px" height="14px" />
          </div>
        </div>
      </div>
      <Skeleton height="300px" className="skeleton-gig-slider" />
      <div className="skeleton-gig-description">
        <Skeleton width="40%" height="20px" />
        <SkeletonText lines={4} />
      </div>
      <div className="skeleton-seller-description">
        <Skeleton width="40%" height="20px" />
        <div className="skeleton-seller-profile">
          <SkeletonAvatar size="80px" />
          <div>
            <Skeleton width="150px" height="18px" />
            <Skeleton width="100px" height="14px" />
            <Skeleton width="120px" height="14px" />
          </div>
        </div>
        <SkeletonText lines={3} />
      </div>
    </div>
  );
};

// Skeleton for gig price card
export const SkeletonGigPrice = () => {
  return (
    <div className="skeleton-gig-price">
      <Skeleton width="60%" height="20px" />
      <Skeleton width="40%" height="30px" />
      <Skeleton width="100%" height="16px" />
      <Skeleton width="100%" height="16px" />
      <Skeleton width="100%" height="40px" borderRadius="4px" />
    </div>
  );
};

// Skeleton for explore page filters
export const SkeletonExploreFilters = () => {
  return (
    <div className="skeleton-explore-filters">
      <Skeleton width="100%" height="40px" />
      <div className="skeleton-filter-options">
        {Array(5).fill().map((_, i) => (
          <Skeleton key={i} width="18%" height="30px" />
        ))}
      </div>
    </div>
  );
};

export default {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonMessage,
  SkeletonOrder,
  SkeletonGigDetail,
  SkeletonGigPrice,
  SkeletonExploreFilters
};