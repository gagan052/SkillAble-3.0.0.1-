import React, { useState, useEffect, useMemo, useCallback } from "react";
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

  // Fetch gig data with optimized caching
  const { isLoading, error, data } = useQuery({
    queryKey: ["gig", id],
    queryFn: () =>
      newRequest.get(`/gigs/single/${id}`).then((res) => {
        return res.data;
      }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 1,
  });

  // Memoize userId to prevent unnecessary re-renders
  const userId = useMemo(() => data?.userId, [data]);

  // Check if gig is saved by current user - optimized with proper caching
  const { data: savedGigData } = useQuery({
    queryKey: ["savedGig", id],
    queryFn: async () => {
      if (!currentUser) return { isSaved: false };
      try {
        const res = await newRequest.get(`/saved-gigs/check/${id}`);
        return res.data;
      } catch (error) {
        console.error("Error checking saved status:", error);
        return { isSaved: false };
      }
    },
    enabled: !!currentUser && !!id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    onSuccess: (data) => {
      setIsSaved(data.isSaved);
    },
  });

  // Check if user is following the seller - optimized with proper caching
  const { data: followingData } = useQuery({
    queryKey: ["following", userId, currentUser?._id],
    queryFn: async () => {
      if (!currentUser || !userId) return { isFollowing: false };
      try {
        const res = await newRequest.get(`/users/${currentUser._id}`);
        const isFollowing = res.data.following?.includes(userId) || false;
        return { isFollowing };
      } catch (error) {
        console.error("Error checking following status:", error);
        return { isFollowing: false };
      }
    },
    enabled: !!currentUser && !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    onSuccess: (data) => {
      setIsFollowing(data.isFollowing);
    },
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
    onError: (error) => {
      console.error("Error saving gig:", error);
    }
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

  // Handle save gig - memoized to prevent unnecessary re-renders
  const handleSaveGig = useCallback(() => {
    if (!currentUser) {
      alert("You need to be logged in to save gigs!");
      return;
    }
    
    saveGigMutation.mutate(id);
  }, [currentUser, id, saveGigMutation]);

  // Handle share gig - memoized to prevent unnecessary re-renders
  const handleShareGig = useCallback(() => {
    if (!data) return;
    
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
  }, [data]);

  // Handle message button click - memoized to prevent unnecessary re-renders
  const handleMessage = useCallback(() => {
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
  }, [currentUser, userId, createConversationMutation]);

  // Fetch user data with optimized caching
  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      try {
        const res = await newRequest.get(`/users/${userId}`);
        return res.data;
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    cacheTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });

  // Fetch recommended gigs from the same category - optimized with proper caching and error handling
  const {
    isLoading: isLoadingRecommendations,
    error: errorRecommendations,
    data: recommendedGigs,
  } = useQuery({
    queryKey: ["recommendedGigs", data?.cat, id],
    queryFn: async () => {
      try {
        // If no category is available, use a fallback
        const category = data?.cat || 'general';
        
        try {
          // First try category-specific recommendations
          const response = await newRequest.get(`/gigs/recommendations/${category}?excludeId=${id}`);
          return response.data;
        } catch (categoryError) {
          // If category-specific fails, try general recommendations
          const response = await newRequest.get(`/gigs/recommendations?excludeId=${id}`);
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        throw error;
      }
    },
    enabled: !!id && !!data?.cat, // Only enable when we have both gig ID and category
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
    retry: 1, // Retry once
    retryDelay: 1000, // Wait 1 second between retries
  });

  // Memoize the rating calculation to prevent recalculation on each render
  const rating = useMemo(() => {
    if (!data || isNaN(data.totalStars / data.starNumber)) return null;
    return Math.round(data.totalStars / data.starNumber);
  }, [data]);

  // Skeleton loader components
  const GigSkeleton = () => (
    <div className="container">
      <div className="left">
        <div className="breadcrumbs skeleton-text"></div>
        <div className="skeleton-title"></div>
        <div className="user skeleton">
          <div className="skeleton-circle"></div>
          <div className="user-info">
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
        <div className="slider-container skeleton"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
      </div>
      <div className="right">
        <div className="price skeleton">
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
        </div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );

  const UserSkeleton = () => (
    <div className="user skeleton">
      <div className="skeleton-circle"></div>
      <div className="user-info">
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
      </div>
    </div>
  );

  // Memoize the slider content to prevent unnecessary re-renders
  const SliderContent = useMemo(() => {
    if (!data?.images) return null;
    
    return (
      <Slider slidesToShow={1} arrowsScroll={1} className="slider" dots arrows>
        {data.images.map((item, index) => {
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
                  loading="lazy"
                >
                  <source src={url} type={url.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'video/webm'} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img src={url} alt={`Gig content ${index + 1}`} loading="lazy" />
              )}
            </div>
          );
        })}
      </Slider>
    );
  }, [data?.images]);

  // Memoize the features list to prevent unnecessary re-renders
  const FeaturesList = useMemo(() => {
    if (!data?.features) return null;
    
    return (
      <div className="features">
        {data.features.map((feature) => (
          <div className="item" key={feature}>
            <img src="/img/greencheck.png" alt="" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    );
  }, [data?.features]);

  // Memoize the recommended gigs to prevent unnecessary re-renders
  const RecommendedGigsList = useMemo(() => {
    if (!recommendedGigs || recommendedGigs.length === 0) return null;
    
    return (
      <div className="recommended-gigs">
        {recommendedGigs.slice(0, 4).map((gig) => (
          <GigCard key={gig._id} item={gig} />
        ))}
      </div>
    );
  }, [recommendedGigs]);

  return (
    <div className="gig">
      {isLoading ? (
        <GigSkeleton />
      ) : error ? (
        <div className="error-container">
          <h2>Something went wrong!</h2>
          <p>{error.message || "Failed to load gig details"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="container">
          <div className="left">
            <div className="breadcrumbs">
              <Link to="/">SkillAble</Link> {" > "}
              <Link to={`/gigs?cat=${data.cat}`}>{data.cat}</Link> {" > "}
              <span>{data.title.substring(0, 30)}{data.title.length > 30 ? "..." : ""}</span>
            </div>
            <h1>{data.title}</h1>
            {isLoadingUser ? (
              <UserSkeleton />
            ) : errorUser ? (
              <div className="error-message">
                <p>Could not load seller information</p>
              </div>
            ) : (
              <div className="user">
                <img
                  className="pp"
                  src={dataUser.img || "/img/noavatar.jpg"}
                  alt={`${dataUser.username}'s profile`}
                  loading="lazy"
                />
                <div className="user-info">
                  <div className="user-name-stars">
                    <span className="username">{dataUser.username}</span>
                    {rating && (
                      <div className="stars">
                        {Array(rating)
                          .fill()
                          .map((_, i) => (
                            <img src="/img/star.png" alt="rating star" key={i} />
                          ))}
                        <span>{rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="slider-container">
              {SliderContent}
            </div>
            
            <h2>About This Gig</h2>
            <p>{data.desc}</p>
            
            {isLoadingUser ? (
              <div className="seller skeleton">
                <div className="skeleton-title"></div>
                <div className="user skeleton">
                  <div className="skeleton-circle"></div>
                  <div className="skeleton-text"></div>
                </div>
                <div className="box skeleton">
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text"></div>
                </div>
              </div>
            ) : errorUser ? (
              <div className="error-message">
                <p>Could not load seller information</p>
              </div>
            ) : (
              <div className="seller">
                <h2>About The Seller</h2>
                <div className="user">
                  <img 
                    src={dataUser.img || "/img/noavatar.jpg"} 
                    alt="" 
                    loading="lazy"
                  />
                  <div className="info">
                    <span>{dataUser.username}</span>
                    <span className="followers">{dataUser.followersCount || 0} followers</span>
                    {rating && (
                      <div className="stars">
                        {Array(rating)
                          .fill()
                          .map((_, i) => (
                            <img src="/img/star.png" alt="" key={i} />
                          ))}
                        <span>{rating}</span>
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
                    className="retry-button"
                  >
                    Try Again
                  </button>
                </div>
              ) : RecommendedGigsList || (
                <div className="no-recommendations">
                  <p>No recommendations available at the moment</p>
                  <p className="secondary-text">
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
            
            {FeaturesList}
            
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