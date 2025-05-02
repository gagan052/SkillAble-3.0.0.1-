 
import React, { useState, useEffect } from "react";
import "./GigCard.scss";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import FollowButton from "../followButton/FollowButton";

const GigCard = ({ item }) => {
  // Enhanced validation for gig item
  if (!item) {
    console.error('Missing gig item');
    return null;
  }
  
  // Log the item structure to help with debugging
  console.log('GigCard received item:', item);
  
  // Check for required properties
  if (!item._id) {
    console.error('Invalid gig item (missing _id):', item);
    return null;
  }
  
  // Ensure all required properties exist with fallbacks
  const safeItem = {
    ...item,
    title: item.title || 'Untitled Gig',
    cover: item.cover || '/img/noimage.jpg',
    price: item.price || 0,
    userId: item.userId || '',
    totalStars: item.totalStars || 0,
    starNumber: item.starNumber || 0
  };
  const [isSaved, setIsSaved] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  const { isLoading, error, data } = useQuery({
    queryKey: [safeItem.userId],
    queryFn: () => {
      if (!safeItem.userId) {
        console.log('No userId available for user query');
        return Promise.resolve(null);
      }
      return newRequest.get(`/users/${safeItem.userId}`).then((res) => {
        return res.data;
      });
    },
    enabled: !!safeItem.userId,
  });


  // Check if gig is saved by current user
  const { data: savedGigStatus } = useQuery({
    queryKey: ["savedGig", safeItem._id],
    queryFn: () => newRequest.get(`/saved-gigs/check/${safeItem._id}`).then((res) => res.data),
    enabled: !!currentUser && !!safeItem._id,
    retry: 1,
    onError: (error) => {
      console.error("Error checking saved status:", error);
    }
  });

  // Update saved status when savedGigStatus changes
  useEffect(() => {
    if (savedGigStatus) {
      setIsSaved(savedGigStatus.isSaved);
    }
  }, [savedGigStatus]);
  
  // Save gig mutation
  const saveGigMutation = useMutation({
    mutationFn: (gigId) => {
      return newRequest.put(`/saved-gigs/toggle/${gigId}`);
    },
    onSuccess: (response) => {
      // Update the local state immediately
      setIsSaved(response.data.isSaved);
      // Invalidate and refetch the saved gigs list and status
      queryClient.invalidateQueries(["savedGigs"]);
      queryClient.invalidateQueries(["savedGig", item._id]);
    },
    onError: (error) => {
      console.error("Error saving gig:", error);
      // More user-friendly error message
      if (error.response && error.response.status === 401) {
        alert("You need to be logged in to save gigs!");
      } else {
        alert("Failed to save gig. Please try again.");
      }
    }
  });
  
  // Handle save gig
  const handleSaveGig = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      alert("You need to be logged in to save gigs!");
      return;
    }
    
    // Disable the button during the mutation to prevent multiple clicks
    if (saveGigMutation.isLoading) return;
    
    saveGigMutation.mutate(safeItem._id);
  };
  
  // Handle share gig
  const handleShareGig = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (navigator.share) {
        navigator.share({
          title: safeItem.title || 'Check out this gig',
          text: safeItem.shortDesc || 'Found an interesting gig',
          url: window.location.origin + `/gig/${safeItem._id}`,
        })
        .catch((error) => {
          console.log('Error sharing:', error);
          // Fallback if share fails
          copyToClipboard();
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        copyToClipboard();
      }
    } catch (error) {
      console.error('Share error:', error);
      copyToClipboard();
    }
  };
  
  // Helper function to copy URL to clipboard
  const copyToClipboard = () => {
    const url = window.location.origin + `/gig/${safeItem._id}`;
    navigator.clipboard.writeText(url)
      .then(() => alert("Link copied to clipboard!"))
      .catch(err => {
        console.error('Failed to copy:', err);
        alert("Couldn't copy link. The URL is: " + url);
      });
  };

  return (
    <Link to={`/gig/${safeItem._id}`} className="link">
      <div className="gigCard">
        <img src={safeItem.cover || "/img/noavatar.jpg"} alt="Gig Cover" />
        <div className="info">
          {isLoading ? (
            "loading"
          ) : error ? (
            "Something went wrong!"
          ) : (
            <div className="user">
              <img src={data?.img || "/img/noavatar.jpg"} alt="User Avatar" />
              <div className="user-info">
                <span className="username">{data?.username || "User"}</span>
                <span className="followers">{data?.followersCount || 0} followers</span>
              </div>
              <FollowButton userId={safeItem.userId} size="small" />
            </div>
          )}
          <p className="desc">{safeItem.shortDesc || safeItem.desc || "No description available"}</p>
          <div className="star">
            <img src="/img/star.png" alt="Rating Star" />
            <span>
              {!isNaN(safeItem.totalStars / safeItem.starNumber) && safeItem.starNumber > 0
                ? Math.round(safeItem.totalStars / safeItem.starNumber)
                : "New"}
            </span>
          </div>
        </div>
        <hr />
        <div className="detail">
          {/* Action buttons */}
          <div className="actions">
            <img 
              src={isSaved ? "/img/bookmark-fill.png" : "/img/bookmark-line.png"} 
              alt="Save" 
              className={`action-icon ${isSaved ? "saved" : ""}`}
              onClick={handleSaveGig}
              title={isSaved ? "Unsave" : "Save"}
            />
            <img 
              src="/img/share-line.png" 
              alt="Share" 
              className="action-icon"
              onClick={handleShareGig}
              title="Share"
            />
          </div>

          <div className="price">
            <span>STARTING AT</span>
            <h2>$ {safeItem.price}</h2>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
