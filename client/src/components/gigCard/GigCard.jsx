import React, { useState, useEffect } from "react";
import "./GigCard.scss";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const GigCard = ({ item }) => {
  const [isSaved, setIsSaved] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  const { isLoading, error, data } = useQuery({
    queryKey: [item.userId],
    queryFn: () =>
      newRequest.get(`/users/${item.userId}`).then((res) => {
        return res.data;
      }),
  });

  // Check if gig is saved by current user
  const { data: savedGigStatus } = useQuery({
    queryKey: ["savedGig", item._id],
    queryFn: () => newRequest.get(`/saved-gigs/check/${item._id}`).then((res) => res.data),
    enabled: !!currentUser,
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
      alert("Failed to save gig. Please try again.");
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
    
    saveGigMutation.mutate(item._id);
  };
  
  // Handle share gig
  const handleShareGig = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.shortDesc,
        url: window.location.origin + `/gig/${item._id}`,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      const url = window.location.origin + `/gig/${item._id}`;
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <Link to={`/gig/${item._id}`} className="link">
      <div className="gigCard">
        <img src={item.cover} alt="imageNotLoaded" />
        <div className="info">
          {isLoading ? (
            "loading"
          ) : error ? (
            "Something went wrong!"
          ) : (
            <div className="user">
              <img src={data.img || "/img/noavatar.jpg"} alt="" />
              <span>{data.username}</span>
            </div>
          )}
          <p className="desc">{item.desc}</p>
          <div className="star">
            <img src="/img/star.png" alt="" />
            <span>
              {!isNaN(item.totalStars / item.starNumber) &&
                Math.round(item.totalStars / item.starNumber)}
            </span>
          </div>
        </div>
        <hr />
        <div className="detail">
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
            <h2>$ {item.price}</h2>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
