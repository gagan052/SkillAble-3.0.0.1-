import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./Dashboard.scss";
import { useNavigate, Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { useQuery, useQueries } from "@tanstack/react-query";
import { formatDistance } from 'date-fns';
import { AiOutlineUser, AiOutlineUserAdd } from 'react-icons/ai';

function Dashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("gigs");

  // Redirect to login if no user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);
  
  // Fetch user orders (purchases)
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["userOrders"],
    queryFn: async () => {
      try {
        const res = await newRequest.get("/orders");
        // Filter orders for the current user
        return Array.isArray(res.data) ? res.data.filter(order => 
          order.buyerId === currentUser._id || 
          (currentUser.isSeller && order.sellerId === currentUser._id)
        ) : [];
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

  // Fetch purchase count (buyer's perspective)
  const { data: purchasesData } = useQuery({
    queryKey: ["userPurchases"],
    queryFn: async () => {
      try {
        const res = await newRequest.get("/orders/my-purchases");
        return res.data || [];
      } catch (error) {
        console.error("Error fetching purchases:", error);
        return [];
      }
    },
    enabled: !!currentUser && !currentUser.isSeller,
  });

  // Fetch user messages/conversations
  const { data: messagesData } = useQuery({
    queryKey: ["userMessages"],
    queryFn: async () => {
      try {
        const res = await newRequest.get("/conversations");
        return Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

  // Fetch user gigs if seller
  const { data: gigsData, isLoading: gigsLoading } = useQuery({
    queryKey: ["userGigs"],
    queryFn: async () => {
      try {
        const res = await newRequest.get("/gigs?userId=" + currentUser._id);
        return Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error("Error fetching gigs:", error);
        return [];
      }
    },
    enabled: !!currentUser && currentUser.isSeller,
  });

  // Fetch saved gigs
  const { data: savedGigsData, isLoading: savedGigsLoading } = useQuery({
    queryKey: ["savedGigs"],
    queryFn: async () => {
      try {
        const res = await newRequest.get("/saved-gigs");
        return res.data || [];
      } catch (error) {
        console.error("Error fetching saved gigs:", error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

  // Fetch user data for all saved gigs using useQueries
  const savedGigsUserQueries = useQueries({
    queries: (savedGigsData || [])
      .filter(gig => gig?.gigId?.userId) // Filter out items with missing userId
      .map(gig => ({
        queryKey: ["user", gig.gigId.userId],
        queryFn: async () => {
          try {
            const res = await newRequest.get(`/users/${gig.gigId.userId}`);
            return {
              userId: gig.gigId.userId,
              userData: res.data
            };
          } catch (error) {
            console.error(`Error fetching user ${gig.gigId.userId}:`, error);
            return {
              userId: gig.gigId.userId,
              userData: null
            };
          }
        },
        enabled: !!gig.gigId?.userId,
      })),
  });

  // Create a map of userId -> userData for easy lookup
  const userDataMap = useMemo(() => {
    const map = {};
    savedGigsUserQueries.forEach(query => {
      if (query.data?.userId && query.data?.userData) {
        map[query.data.userId] = query.data.userData;
      }
    });
    return map;
  }, [savedGigsUserQueries]);

  // Fetch followers/following with details
  const { data: followersData, isLoading: followersLoading, error: followersError } = useQuery({
    queryKey: ["userFollowers"],
    queryFn: async () => {
      try {
        const res = await newRequest.get(`/follows/followers/${currentUser._id}`);
        return res.data || [];
      } catch (error) {
        console.error("Error fetching followers:", error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

  const { data: followingData, isLoading: followingLoading, error: followingError } = useQuery({
    queryKey: ["userFollowing"],
    queryFn: async () => {
      try {
        const res = await newRequest.get(`/follows/following/${currentUser._id}`);
        return res.data || [];
      } catch (error) {
        console.error("Error fetching following:", error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

  if (!currentUser) return null;

  // Calculate stats
  const stats = useMemo(() => {
    return [
      {
        value: currentUser.isSeller ? gigsData?.length || 0 : purchasesData?.length || 0,
        label: currentUser.isSeller ? 'Gigs' : 'Purchases',
      },
      {
        value: followersData?.length || 0,
        label: 'Followers',
      },
      {
        value: followingData?.length || 0,
        label: 'Following',
      },
    ].filter(item => item.label !== ''); // Filter out empty labels
  }, [currentUser.isSeller, gigsData, purchasesData, followersData, followingData]);

  // Tab content renderer
  const getTabContent = () => {
    switch (activeTab) {
      case "gigs":
        // User gigs view (or purchases for non-sellers)
        if (!currentUser.isSeller) {
          return (
            <div className="gigs-grid">
              {ordersLoading ? (
                <div className="loading-grid">Loading purchases...</div>
              ) : !purchasesData || purchasesData.length === 0 ? (
                <div className="empty-state">
                  <img src="/img/empty-purchases.png" alt="No purchases" />
                  <p>You haven't made any purchases yet</p>
                  <button onClick={() => navigate("/gigs")}>Explore Gigs</button>
                </div>
              ) : (
                purchasesData.map((purchase) => (
                  <Link to={`/gig/${purchase.gigId}`} className="gig-item" key={purchase._id}>
                    <div className="gig-image">
                      <img src={purchase.cover || "/img/noimage.jpg"} alt={purchase.title} />
                    </div>
                    <div className="gig-info">
                      <h4>{purchase.title}</h4>
                      <p>${purchase.price}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          );
        }
        
        // Seller's gigs view
        return (
          <div className="gigs-grid">
            {gigsLoading ? (
              <div className="loading-grid">Loading gigs...</div>
            ) : !gigsData || gigsData.length === 0 ? (
              <div className="empty-state">
                <img src="/img/empty-gigs.png" alt="No gigs" />
                <p>You haven't created any gigs yet</p>
                <button onClick={() => navigate("/add")}>Create a Gig</button>
              </div>
            ) : (
              gigsData.map((gig) => (
                <Link to={`/gig/${gig._id}`} className="gig-item" key={gig._id}>
                  <div className="gig-image">
                    <img src={gig.cover || "/img/noimage.jpg"} alt={gig.title} />
                  </div>
                  <div className="gig-info">
                    <h4>{gig.title}</h4>
                    <p>${gig.price}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        );
        
      case "saved":
        // Saved gigs view
        return (
          <div className="gigs-grid">
            {savedGigsLoading ? (
              <div className="loading-grid">Loading saved gigs...</div>
            ) : !savedGigsData || savedGigsData.length === 0 ? (
              <div className="empty-state">
                <img src="/img/empty-saved.png" alt="No saved gigs" />
                <p>You haven't saved any gigs yet</p>
                <button onClick={() => navigate("/gigs")}>Explore Gigs</button>
              </div>
            ) : (
              savedGigsData.map((gig) => {
                // Skip rendering if gigId is missing or invalid
                if (!gig.gigId) {
                  console.warn("Found saved gig with missing gigId:", gig);
                  return null;
                }
                
                // Get user data from the map
                const sellerData = userDataMap[gig.gigId.userId];
                
                return (
                  <Link to={`/gig/${gig.gigId._id}`} className="gig-item" key={gig._id}>
                    <div className="gig-image">
                      <img src={gig.gigId.cover || "/img/noimage.jpg"} alt={gig.gigId.title || "Gig"} />
                    </div>
                    
                    {sellerData && (
                      <div className="user">
                        <img src={sellerData.img || "/img/noavatar.jpg"} alt={sellerData.username || "User"} />
                        <div className="user-info">
                          <span className="username">{sellerData.username}</span>
                          <span className="followers">{sellerData.followersCount || 0} followers</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="gig-info">
                      <h4>{gig.gigId.title || "Untitled Gig"}</h4>
                      <p>${gig.gigId.price || 0}</p>
                    </div>
                  </Link>
                );
              }).filter(Boolean) // Filter out any null items (skipped gigs)
            )}
          </div>
        );
        
      case "orders":
        return (
          <div className="orders-list">
            {ordersLoading ? (
              <div className="loading-grid">Loading orders...</div>
            ) : !ordersData || ordersData.length === 0 ? (
              <div className="empty-state">
                <img src="/img/empty-orders.png" alt="No orders" />
                <p>You don't have any orders yet</p>
                <button onClick={() => navigate("/gigs")}>Find services</button>
              </div>
            ) : (
              <div className="orders-table">
                <div className="table-header">
                  <div className="header-cell">Service</div>
                  <div className="header-cell">Price</div>
                  <div className="header-cell">Status</div>
                  <div className="header-cell">Date</div>
                </div>
                {ordersData.map((order) => (
                  <div className="order-row" key={order._id}>
                    <div className="cell title" data-label="Service">{order.title}</div>
                    <div className="cell price" data-label="Price">${order.price}</div>
                    <div className="cell status" data-label="Status">
                      <span className={`status-badge ${order.status}`}>{order.status}</span>
                    </div>
                    <div className="cell date" data-label="Date">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case "followers":
        return (
          <div className="users-list">
            {followersLoading ? (
              <div className="loading-grid">Loading followers...</div>
            ) : followersError ? (
              <div className="error">Error loading followers</div>
            ) : followersData.length === 0 ? (
              <div className="empty-state">
                <AiOutlineUser size={40} />
                <p>No followers yet</p>
              </div>
            ) : (
              <div className="users-grid">
                {followersData.map(follower => (
                  <Link to={`/profile/${follower._id}`} key={follower._id} className="user-card">
                    <div className="user-avatar">
                      <img 
                        src={follower.img || "/img/noavatar.jpg"} 
                        alt={follower.username} 
                      />
                    </div>
                    <div className="user-info">
                      <h4>{follower.username}</h4>
                      <p>{follower.desc?.substring(0, 50) || "No description"}{follower.desc?.length > 50 ? "..." : ""}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
        
      case "following":
        return (
          <div className="users-list">
            {followingLoading ? (
              <div className="loading-grid">Loading following...</div>
            ) : followingError ? (
              <div className="error">Error loading following</div>
            ) : followingData.length === 0 ? (
              <div className="empty-state">
                <AiOutlineUserAdd size={40} />
                <p>Not following anyone yet</p>
              </div>
            ) : (
              <div className="users-grid">
                {followingData.map(following => (
                  <Link to={`/profile/${following._id}`} key={following._id} className="user-card">
                    <div className="user-avatar">
                      <img 
                        src={following.img || "/img/noavatar.jpg"} 
                        alt={following.username} 
                      />
                    </div>
                    <div className="user-info">
                      <h4>{following.username}</h4>
                      <p>{following.desc?.substring(0, 50) || "No description"}{following.desc?.length > 50 ? "..." : ""}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="instagram-dashboard">
      <div className="container">
        {/* Profile Header Section */}
        <div className="profile-header">
            <div className="profile-image">
              <img src={currentUser.img || "/img/noavatar.jpg"} alt="Profile" />
          </div>

          <div className="profile-info">
            <div className="profile-top">
              <h1>{currentUser.username}</h1>
              {currentUser.isSeller && (
                <span className="badge seller-badge">Seller</span>
              )}
              <button className="edit-profile-btn" onClick={() => navigate("/settings")}>
                Edit Profile
              </button>
            </div>
            
            <div className="profile-stats">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="stat" 
                  onClick={() => {
                    if (stat.label === 'Followers') setActiveTab('followers');
                    if (stat.label === 'Following') setActiveTab('following');
                    if (stat.label === 'Orders' || stat.label === 'Purchases') {
                      // Navigate to orders page or handle as needed
                    }
                  }}
                >
                  <span className="count">{stat.value}</span>
                  <span className="label">{stat.label}</span>
                </div>
              ))}
            </div>
            
            <div className="profile-bio">
              <h2>{currentUser.fullname || currentUser.username}</h2>
              <p>{currentUser.desc || "No description provided"}</p>
              <p className="location">{currentUser.country || "No location set"}</p>
              <p className="member-since">Member since {new Date(currentUser.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        {/* Content Tabs */}
        <div className="content-tabs">
          <div 
            className={`tab ${activeTab === 'gigs' ? 'active' : ''}`}
            onClick={() => setActiveTab('gigs')}
          >
            <i className="tab-icon grid-icon"></i>
            <span>{currentUser.isSeller ? 'GIGS' : 'PURCHASES'}</span>
          </div>
          
          <div 
            className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <i className="tab-icon bookmark-icon"></i>
            <span>SAVED</span>
          </div>
          
          <div 
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="tab-icon tag-icon"></i>
            <span>ORDERS</span>
          </div>
          
          <div 
            className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            <i className="tab-icon followers-icon"></i>
            <span>FOLLOWERS</span>
          </div>
          
          <div 
            className={`tab ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            <i className="tab-icon following-icon"></i>
            <span>FOLLOWING</span>
              </div>
            </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {getTabContent()}
        </div>
        
        {/* CTA Section */}
        {currentUser.isSeller && activeTab === 'gigs' && (
          <div className="cta-section">
            <button className="create-gig-btn" onClick={() => navigate("/add")}>
              Create New Gig
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;