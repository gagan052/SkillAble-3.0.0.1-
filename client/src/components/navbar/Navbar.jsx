import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();

  const isActive = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      localStorage.setItem("currentUser", null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const scrollToFeaturesDark = () => {
    // Navigate to home page if not already there
    if (pathname !== "/") {
      navigate("/");
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const featuresDarkSection = document.querySelector(".features.dark");
        if (featuresDarkSection) {
          featuresDarkSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const featuresDarkSection = document.querySelector(".features.dark");
      if (featuresDarkSection) {
        featuresDarkSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const scrollToExplore = () => {
    // Navigate to home page if not already there
    if (pathname !== "/") {
      navigate("/");
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const exploreSection = document.getElementById("explore");
        if (exploreSection) {
          exploreSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const exploreSection = document.getElementById("explore");
      if (exploreSection) {
        exploreSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className={active || pathname !== "/" ? "navbar active" : "navbar"}>
      <div className="container">
        <div className="logo">
          <Link className="link" to="/" onClick={scrollToTop}>
            <span className="text">SkillAble</span>
          </Link>
          <span className="dot">.</span>
        </div>
        <div className="links">
          <span onClick={() => scrollToFeaturesDark()}>SkillAble Business</span>
          <Link className="link" to="/explore"><span>Explore</span></Link>
          <span>English</span>
          {!currentUser?.isSeller && <span>Become a Seller</span>}
          {currentUser ? (
            <div className="user" onClick={() => setOpen(!open)}>
              <img src={currentUser.img || "/img/noavatar.jpg"} alt="" />
              <span>{currentUser?.username}</span>
              {open && (
                <div className="options">
                  {currentUser.isSeller && (
                    <>
                      <Link className="link" to="/mygigs">
                        Gigs
                      </Link>
                      <Link className="link" to="/add">
                        Add New Gig
                      </Link>
                    </>
                  )}
                  <Link className="link" to="/orders">
                    Orders
                  </Link>
                  <Link className="link" to="/messages">
                    Messages
                  </Link>
                  <Link className="link" to="/saved">
                    Saved Gigs
                  </Link>
                  <Link className="link" onClick={handleLogout}>
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="link">Login</Link>
              <Link className="link" to="/register">
                <button>Register</button>
              </Link>
            </>
          )}
        </div>
      </div>
      {(active || pathname !== "/") && (
        <>
          <hr />
          <div className="menu-container">
            <div className="menu">
              {/* First set of menu items */}
              <Link className="link menuLink" to="/gigs?cat=graphics_design">
                Graphics & Design
              </Link>
              <Link className="link menuLink" to="/gigs?cat=video_animation">
                Video & Animation
              </Link>
              <Link className="link menuLink" to="/gigs?cat=writing_translation">
                Writing & Translation
              </Link>
              <Link className="link menuLink" to="/gigs?cat=ai_services">
                AI Services
              </Link>
              <Link className="link menuLink" to="/gigs?cat=digital_marketing">
                Digital Marketing
              </Link>
              <Link className="link menuLink" to="/gigs?cat=music_audio">
                Music & Audio
              </Link>
              <Link className="link menuLink" to="/gigs?cat=programming_tech">
                Programming & Tech
              </Link>
              <Link className="link menuLink" to="/gigs?cat=business">
                Business
              </Link>
              <Link className="link menuLink" to="/gigs?cat=lifestyle">
                Lifestyle
              </Link>
              <Link className="link menuLink" to="/gigs?cat=photography">
                Photography
              </Link>
              <Link className="link menuLink" to="/gigs?cat=data">
                Data
              </Link>
              <Link className="link menuLink" to="/gigs?cat=voice_over">
                Voice Over
              </Link>
              <Link className="link menuLink" to="/gigs?cat=video_explainer">
                Video Explainer
              </Link>
              <Link className="link menuLink" to="/gigs?cat=social_media">
                Social Media
              </Link>
              <Link className="link menuLink" to="/gigs?cat=seo">
                SEO
              </Link>
              <Link className="link menuLink" to="/gigs?cat=illustration">
                Illustration
              </Link>
              <Link className="link menuLink" to="/gigs?cat=logo_design">
                Logo Design
              </Link>
              <Link className="link menuLink" to="/gigs?cat=wordpress">
                WordPress
              </Link>
              <Link className="link menuLink" to="/gigs?cat=web_mobile_design">
                Web & Mobile Design
              </Link>
              <Link className="link menuLink" to="/gigs?cat=packaging_design">
                Packaging Design
              </Link>
              <Link className="link menuLink" to="/gigs?cat=book_design">
                Book Design
              </Link>
              
              {/* Duplicate set of menu items for continuous scrolling */}
              <Link className="link menuLink" to="/gigs?cat=graphics_design">
                Graphics & Design
              </Link>
              <Link className="link menuLink" to="/gigs?cat=video_animation">
                Video & Animation
              </Link>
              <Link className="link menuLink" to="/gigs?cat=writing_translation">
                Writing & Translation
              </Link>
              <Link className="link menuLink" to="/gigs?cat=ai_services">
                AI Services
              </Link>
              <Link className="link menuLink" to="/gigs?cat=digital_marketing">
                Digital Marketing
              </Link>
              <Link className="link menuLink" to="/gigs?cat=music_audio">
                Music & Audio
              </Link>
              <Link className="link menuLink" to="/gigs?cat=programming_tech">
                Programming & Tech
              </Link>
              <Link className="link menuLink" to="/gigs?cat=business">
                Business
              </Link>
              <Link className="link menuLink" to="/gigs?cat=lifestyle">
                Lifestyle
              </Link>
              <Link className="link menuLink" to="/gigs?cat=photography">
                Photography
              </Link>
              <Link className="link menuLink" to="/gigs?cat=data">
                Data
              </Link>
            </div>
          </div>
          <hr />
        </>
      )}
    </div>
  );
}

export default Navbar;
