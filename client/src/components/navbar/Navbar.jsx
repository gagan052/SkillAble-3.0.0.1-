import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";
import { FaBars, FaTimes, FaBell, FaChevronDown } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mobileMenuRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const userDropdownRef = useRef(null);
  const usernameContainerRef = useRef(null);
  const notificationRef = useRef(null);
  const notificationIconRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Check if we're on an individual message page (not the messages list)
  const isIndividualMessagePage = pathname.startsWith('/message/') && pathname !== '/messages';

  const { isLoading, error, data } = useQuery({
    queryKey: ["savedGigs"],
    queryFn: () =>
      newRequest.get("/saved-gigs").then((res) => {
        return res.data;
      }),
    enabled: !!currentUser,
  });
  
  // Fetch notifications
  const { data: notificationData, refetch: refetchNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await newRequest.get("/notifications");
        setNotifications(res.data);
        return res.data;
      } catch (err) {
        console.error("Error fetching notifications:", err);
        return [];
      }
    },
    enabled: !!currentUser,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await newRequest.put(`/notifications/${notificationId}/read`);
      // Update local state to avoid waiting for refetch
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? {...notification, read: true} 
            : notification
        )
      );
      refetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await newRequest.put("/notifications/read-all");
      // Update local state to avoid waiting for refetch
      setNotifications(prev => 
        prev.map(notification => ({...notification, read: true}))
      );
      refetchNotifications();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const isActive = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  useEffect(() => {
    // Close mobile menu when path changes
    setMobileOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  // Handle click outside to close mobile menu and user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile menu if clicked outside
      if (mobileOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          mobileToggleRef.current &&
          !mobileToggleRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
      
      // Close user dropdown if clicked outside
      if (open && 
          userDropdownRef.current && 
          !userDropdownRef.current.contains(event.target) &&
          usernameContainerRef.current &&
          !usernameContainerRef.current.contains(event.target)) {
        setOpen(false);
      }

      // Close notification dropdown if clicked outside
      if (notificationOpen && 
          notificationRef.current && 
          !notificationRef.current.contains(event.target) &&
          notificationIconRef.current &&
          !notificationIconRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen, open, notificationOpen]);

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      localStorage.setItem("currentUser", null);
      queryClient.invalidateQueries(["savedGigs"]);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const scrollToSection = (selector) => {
    if (pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.querySelector(selector);
        section?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const section = document.querySelector(selector);
      section?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileOpen(false);
  };

  // Don't render navbar on individual message pages
  if (isIndividualMessagePage) {
    return null;
  }

  return (
    <div className={active || pathname !== "/" ? "navbar active" : "navbar"}>
      <div className="container">
        {/* Logo */}
        <div className="logo">
          <Link className="link" to="/" onClick={scrollToTop}>
            <span className="text">SkillAble</span>
          </Link>
          <span className="dot">.</span>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu} ref={mobileToggleRef}>
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Links */}
        <div className={`links ${mobileOpen ? "mobile-open" : ""}`} ref={mobileMenuRef}>
          
          {currentUser && (
            <Link className="link" to="/explore" onClick={() => setMobileOpen(false)}>Explore</Link>
          )}
          
          {currentUser ? (
            <>
              <div className="notification">
                <div className="icon" onClick={() => setNotificationOpen(!notificationOpen)} ref={notificationIconRef}>
                  <FaBell />
                  {notifications?.length > 0 && <span className="count">{notifications.length}</span>}
                </div>
                {notificationOpen && (
                  <div className="notification-dropdown" ref={notificationRef}>
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      <div className="notification-actions">
                        {notifications?.length > 0 && (
                          <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                            Mark all as read
                          </button>
                        )}
                        <button 
                          className="close-notifications" 
                          onClick={() => setNotificationOpen(false)}
                          aria-label="Close notifications"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {notifications?.length > 0 ? (
                      <div className="notification-list">
                        {notifications.map((notification) => (
                          <div 
                            key={notification._id} 
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => {
                              handleMarkAsRead(notification._id);
                              setNotificationOpen(false);
                            }}
                          >
                            {notification.sender && notification.sender.img && (
                              <img 
                                src={notification.sender.img || "/img/noavatar.jpg"} 
                                alt="" 
                                className="sender-img"
                              />
                            )}
                            <div className="notification-content">
                              <p>{notification.content}</p>
                              <span className="time">{new Date(notification.createdAt).toLocaleDateString()}</span>
                            </div>
                            {!notification.read && <div className="unread-indicator"></div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-notifications">No notifications yet</p>
                    )}
                  </div>
                )}
              </div>
              <div className="user">
                <div className="user-profile" onClick={() => {
                  navigate("/dashboard");
                  setMobileOpen(false);
                }}>
                  <img
                    src={currentUser.img || "/img/noavatar.jpg"}
                    alt=""
                    style={{ cursor: "pointer" }}
                  />
                  
                </div>
                <div className="username-container" onClick={() => setOpen(!open)} ref={usernameContainerRef}>
                  <span className="username">{currentUser.username}</span>
                  <FaChevronDown className="dropdown-icon" />
                </div>
                {open && (
                <div className="options" ref={userDropdownRef}>
                  {currentUser.isSeller && (
                    <>
                      <Link className="link" to="/mygigs" onClick={() => setMobileOpen(false)}>Gigs</Link>
                      <Link className="link" to="/add" onClick={() => setMobileOpen(false)}>Add New Gig</Link>
                    </>
                  )}
                  <Link className="link" to="/orders" onClick={() => setMobileOpen(false)}>Orders</Link>
                  <Link className="link" to="/messages" onClick={() => setMobileOpen(false)}>Messages</Link>
                  <Link className="link" to="/saved" onClick={() => setMobileOpen(false)}>Saved Gigs</Link>
                  <span className="link" onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}>Logout</span>
                </div>
              )}
            </div>
            </>
          ) : (
            <>
              <Link className="link" to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link className="link" to="/register" onClick={() => setMobileOpen(false)}>
                <button>Register</button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Menu Section - Only visible when scrolled */}
      <div className={active || pathname !== "/" ? "menu-section visible" : "menu-section"}>
        <hr />
        <div className="menu-container">
          <div className="menu">
              {/* Menu items */}
              {[
                { label: "Graphics & Design", path: "graphics_design" },
                { label: "Video & Animation", path: "video_animation" },
                { label: "Writing & Translation", path: "writing_translation" },
                { label: "AI Services", path: "ai_services" },
                { label: "Digital Marketing", path: "digital_marketing" },
                { label: "Music & Audio", path: "music_audio" },
                { label: "Programming & Tech", path: "programming_tech" },
                { label: "Business", path: "business" },
                { label: "Lifestyle", path: "lifestyle" },
                { label: "Photography", path: "photography" },
                { label: "Data", path: "data" },
                { label: "Voice Over", path: "voice_over" },
                { label: "Video Explainer", path: "video_explainer" },
                { label: "Social Media", path: "social_media" },
                { label: "SEO", path: "seo" },
                { label: "Illustration", path: "illustration" },
                { label: "Logo Design", path: "logo_design" },
                { label: "WordPress", path: "wordpress" },
                { label: "Web & Mobile Design", path: "web_mobile_design" },
                { label: "Packaging Design", path: "packaging_design" },
                { label: "Book Design", path: "book_design" },
              ].map(({ label, path }) => (
                <Link 
                  className="link menuLink" 
                  key={path} 
                  to={`/gigs?cat=${path}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}
              
              {/* Duplicate menu items for seamless infinite scrolling */}
              {[
                { label: "Graphics & Design", path: "graphics_design_dup" },
                { label: "Video & Animation", path: "video_animation_dup" },
                { label: "Writing & Translation", path: "writing_translation_dup" },
                { label: "AI Services", path: "ai_services_dup" },
                { label: "Digital Marketing", path: "digital_marketing_dup" },
                { label: "Music & Audio", path: "music_audio_dup" },
                { label: "Programming & Tech", path: "programming_tech_dup" },
                { label: "Business", path: "business_dup" },
                { label: "Lifestyle", path: "lifestyle_dup" },
                { label: "Photography", path: "photography_dup" },
                { label: "Data", path: "data_dup" },
                { label: "Voice Over", path: "voice_over_dup" },
                { label: "Video Explainer", path: "video_explainer_dup" },
                { label: "Social Media", path: "social_media_dup" },
                { label: "SEO", path: "seo_dup" },
                { label: "Illustration", path: "illustration_dup" },
                { label: "Logo Design", path: "logo_design_dup" },
                { label: "WordPress", path: "wordpress_dup" },
                { label: "Web & Mobile Design", path: "web_mobile_design_dup" },
                { label: "Packaging Design", path: "packaging_design_dup" },
                { label: "Book Design", path: "book_design_dup" },
              ].map(({ label, path }) => (
                <Link 
                  className="link menuLink" 
                  key={path} 
                  to={`/gigs?cat=${path.replace('_dup', '')}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <hr />
        </div>
    </div>
  );
}

export default Navbar;
