import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";
import { FaBars, FaTimes } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { isLoading, error, data } = useQuery({
    queryKey: ["savedGigs"],
    queryFn: () =>
      newRequest.get("/gigs/saved").then((res) => {
        return res.data;
      }),
    enabled: !!currentUser,
  });

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
  }, [pathname]);

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
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Links */}
        <div className={`links ${mobileOpen ? "mobile-open" : ""}`}>
          <span onClick={() => scrollToSection(".features.dark")}>SkillAble Business</span>
          <Link className="link" to="/explore" onClick={() => setMobileOpen(false)}>Explore</Link>
          <span>English</span>
          {!currentUser?.isSeller && <span>Become a Seller</span>}
          
          {currentUser ? (
            <div className="user">
              <img
                src={currentUser.img || "/img/noavatar.jpg"}
                alt=""
                onClick={() => {
                  navigate("/dashboard");
                  setMobileOpen(false);
                }}
                style={{ cursor: "pointer" }}
              />
              <span onClick={() => setOpen(!open)}>{currentUser.username}</span>
              {open && (
                <div className="options">
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

      {/* Menu Section */}
      {(active || pathname !== "/") && (
        <>
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
        </>
      )}
    </div>
  );
}

export default Navbar;