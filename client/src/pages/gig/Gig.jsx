import React, { useState, useEffect } from "react";
import "./Gig.scss";
import Slider from "infinite-react-carousel";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";
import FollowButton from "../../components/followButton/FollowButton";
import GigCard from "../../components/gigCard/GigCard";

function Gig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));


  const { isLoading, error, data } = useQuery({
    queryKey: ["gig"],
    queryFn: () =>
      newRequest.get(`/gigs/single/${id}`).then((res) => {
        return res.data;
      }),
  });

  const userId = data?.userId;

  // Check if gig is saved by current user
  useQuery({
    queryKey: ["savedGig", id],
    queryFn: () => {
      if (!currentUser) return { isSaved: false };
      return newRequest.get(`/saved-gigs/check/${id}`).then((res) => {
        setIsSaved(res.data.isSaved);
        return res.data;
      });
    },
    enabled: !!currentUser && !!id,
  });

  // Check if user is following the seller
  useQuery({
    queryKey: ["following", userId],
    queryFn: () => {
      if (!currentUser || !userId) return { isFollowing: false };
      return newRequest.get(`/users/${currentUser._id}`).then((res) => {
        const isFollowing = res.data.following?.includes(userId) || false;
        setIsFollowing(isFollowing);
        return { isFollowing };
      });
    },
    enabled: !!currentUser && !!userId,
  });

  // Save gig mutation
  const saveGigMutation = useMutation({
    mutationFn: (gigId) => {
      return newRequest.put(`/saved-gigs/toggle/${gigId}`);
    },
    onSuccess: (response) => {
      setIsSaved(response.data.isSaved);
      queryClient.invalidateQueries(["savedGig", id]);
      queryClient.invalidateQueries(["savedGigs"]);
    },
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: (conversationData) => {
      return newRequest.post("/conversations", conversationData);
    },
    onSuccess: (response) => {
      // Navigate to the message page with the conversation ID
      navigate(`/message/${response.data.id}`);
    },
    onError: (error) => {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation. Please try again.");
    }
  });

  // Handle save gig
  const handleSaveGig = () => {
    if (!currentUser) {
      alert("You need to be logged in to save gigs!");
      return;
    }
    
    saveGigMutation.mutate(id);
  };

  // Handle share gig
  const handleShareGig = () => {
    if (navigator.share) {
      navigator.share({
        title: data.title,
        text: data.shortDesc,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Handle message button click
  const handleMessage = () => {
    if (!currentUser) {
      alert("You need to be logged in to send messages!");
      return;
    }
    
    // Don't allow sellers to message themselves
    if (currentUser._id === userId) {
      alert("You cannot message yourself!");
      return;
    }
    
    // Create the conversation
    createConversationMutation.mutate({
      to: userId
    });
  };

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => {
        return res.data;
      }),
    enabled: !!userId,
  });

  // Fetch recommended gigs from the same category
  const {
    isLoading: isLoadingRecommendations,
    error: errorRecommendations,
    data: recommendedGigs,
  } = useQuery({
    queryKey: ["recommendedGigs", data?.cat, id],
    queryFn: async () => {
      try {
        // Debug logging
        console.log("Current gig data:", data);
        console.log("Current gig category:", data?.cat);
        console.log("Current gig ID:", id);
        
        // If no category is available, use a fallback
        const category = data?.cat || 'general';
        console.log("Fetching recommendations for category:", category);
        
        let response;
        try {
          // First try category-specific recommendations
          response = await newRequest.get(`/gigs/recommendations/${category}?excludeId=${id}`);
        } catch (categoryError) {
          console.log("Category-specific recommendations failed, trying general recommendations...");
          console.log("Category error:", categoryError);
          // If category-specific fails, try general recommendations
          response = await newRequest.get(`/gigs/recommendations?excludeId=${id}`);
        }
        
        console.log("Recommendations response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        throw error;
      }
    },
    enabled: !!id, // Enable as long as we have a gig ID
    retry: 2, // Retry up to 2 times
    retryDelay: 1000, // Wait 1 second between retries
  });

  return (
    <div className="gig">
      {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="container">
          <div className="left">
            <span className="breadcrumbs">
              SkillAble {">"} Graphics & Design {">"}
            </span>
            <h1>{data.title}</h1>
            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="user">
                <img
                  className="pp"
                  src={dataUser.img || "/img/noavatar.jpg"}
                  alt={`${dataUser.username}'s profile`}
                />
                <div className="user-info">
                  <div className="user-name-stars">
                    <span className="username">{dataUser.username}</span>
                    {!isNaN(data.totalStars / data.starNumber) && (
                      <div className="stars">
                        {Array(Math.round(data.totalStars / data.starNumber))
                          .fill()
                          .map((item, i) => (
                            <img src="/img/star.png" alt="rating star" key={i} />
                          ))}
                        <span>{Math.round(data.totalStars / data.starNumber)}</span>
                      </div>
                    )}
                  </div>
                  {/* <div className="user-stats">
                    <span className="followers">{dataUser.followersCount || 0} followers</span>
                    <FollowButton userId={userId} size="medium" />
                  </div> */}
                </div>
              </div>
            )}
            {/* <Slider slidesToShow={1} arrowsScroll={1} className="slider">
              {data.images.map((img) => (
                <img key={img} src={img} alt="" />
              ))}
            </Slider> */}
            <div className="slider-container">
              <Slider slidesToShow={1} arrowsScroll={1} className="slider" dots arrows>
                {data.images && data.images.map((item, index) => {
                  const url = typeof item === 'object' ? item.url : item;
                  const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm');
                  
                  return (
                    <div key={index} className={`slider-item ${isVideo ? 'video-item' : ''}`}>
                      {isVideo ? (
                        <video 
                          controls
                          playsInline
                          autoPlay
                          controlsList="nodownload"
                          className="slider-video"
                          
                        >
                          <source src={url} type={url.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'video/webm'} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img src={url} alt={`Gig content ${index + 1}`} />
                      )}
                    </div>
                  );
                })}
              </Slider>
            </div>
            <h2>About This Gig</h2>
            <p>{data.desc}</p>
            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="seller">
                <h2>About The Seller</h2>
                <div className="user">
                  <img src={dataUser.img || "/img/noavatar.jpg"} alt="" />
                  <div className="info">
                    <span>{dataUser.username}</span>
                    <span className="followers">{dataUser.followersCount || 0} followers</span>
                    {!isNaN(data.totalStars / data.starNumber) && (
                      <div className="stars">
                        {Array(Math.round(data.totalStars / data.starNumber))
                          .fill()
                          .map((item, i) => (
                            <img src="/img/star.png" alt="" key={i} />
                          ))}
                        <span>
                          {Math.round(data.totalStars / data.starNumber)}
                        </span>
                      </div>
                    )}
                    <div className="seller-actions">
                      <button 
                        onClick={handleMessage}
                        disabled={createConversationMutation.isLoading}
                      >
                        {createConversationMutation.isLoading ? "Creating..." : "Message Seller"}
                      </button>
                      <FollowButton userId={userId} size="medium" />
                    </div>
                  </div>
                </div>
                <div className="box">
                  <div className="items">
                    <div className="item">
                      <span className="title">From</span>
                      <span className="desc">{dataUser.country}</span>
                    </div>
                    <div className="item">
                      <span className="title">Member since</span>
                      <span className="desc">Aug 2022</span>
                    </div>
                    <div className="item">
                      <span className="title">Avg. response time</span>
                      <span className="desc">4 hours</span>
                    </div>
                    <div className="item">
                      <span className="title">Last delivery</span>
                      <span className="desc">1 day</span>
                    </div>
                    <div className="item">
                      <span className="title">Languages</span>
                      <span className="desc">English</span>
                    </div>
                  </div>
                  <hr />
                  <p>{dataUser.desc}</p>
                </div>
              </div>
            )}
            <Reviews gigId={id} gigUserId={userId} />
            
            {/* Recommended Gigs Section */}
            <div className="recommended-section">
              <h2>You might also like</h2>
              {isLoadingRecommendations ? (
                <div className="loading-recommendations">
                  <div className="loading-spinner"></div>
                  <p>Loading recommendations...</p>
                </div>
              ) : errorRecommendations ? (
                <div className="error-recommendations">
                  <p>Unable to load recommendations</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      background: '#1dbf73',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : recommendedGigs && recommendedGigs.length > 0 ? (
                <div className="recommended-gigs">
                  {recommendedGigs.slice(0, 4).map((gig) => (
                    <GigCard key={gig._id} item={gig} />
                  ))}
                </div>
              ) : (
                <div className="no-recommendations">
                  <p>No recommendations available at the moment</p>
                  <p style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>
                    Check back later for more gigs
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="right">
            <div className="price">
              
              <h3>{data.shortTitle}</h3>
              <h2>$ {data.price}</h2>
              
            </div>
            <div className="gig-actions">
              <button 
                className={`action-btn save-btn ${isSaved ? "saved" : ""}`}
                onClick={handleSaveGig}
                title={isSaved ? "Unsave" : "Save"}
              >
                <img src={isSaved ? "/img/bookmark-fill.png" : "/img/bookmark-line.png"} alt="Save" />
                {isSaved ? "Saved" : "Save"}
              </button>
              <button 
                className="action-btn share-btn"
                onClick={handleShareGig}
                title="Share"
              >
                <img src="/img/share-line.png" alt="Share" />
                Share
              </button>
            </div>

            <p>{data.shortDesc}</p>
            <div className="details">
              <div className="item">
                <img src="/img/clock.png" alt="" />
                <span>{data.deliveryDate} Days Delivery</span>
              </div>
              <div className="item">
                <img src="/img/recycle.png" alt="" />
                <span>{data.revisionNumber} Revisions</span>
              </div>
            </div>
            <div className="features">
              {data.features.map((feature) => (
                <div className="item" key={feature}>
                  <img src="/img/greencheck.png" alt="" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <Link to={`/pay/${id}`}>
            <button>Continue</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;