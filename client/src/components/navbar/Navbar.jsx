import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const handleScroll = () => {
      setActive(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      localStorage.setItem("currentUser", null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
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
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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

        {/* Links */}
        <div className="links">
          <span onClick={() => scrollToSection(".features.dark")}>SkillAble Business</span>
          <span onClick={() => scrollToSection("#explore")}>Explore</span>
          <span>English</span>
          {!currentUser?.isSeller && <span>Become a Seller</span>}
          
          {currentUser ? (
            <div className="user">
              <img
                src={currentUser.img || "/img/noavatar.jpg"}
                alt=""
                onClick={() => navigate("/dashboard")}
                style={{ cursor: "pointer" }}
              />
              <span onClick={() => setOpen(!open)}>{currentUser.username}</span>
              {open && (
                <div className="options">
                  {currentUser.isSeller && (
                    <>
                      <Link className="link" to="/mygigs">Gigs</Link>
                      <Link className="link" to="/add">Add New Gig</Link>
                    </>
                  )}
                  <Link className="link" to="/orders">Orders</Link>
                  <Link className="link" to="/messages">Messages</Link>
                  <Link className="link" to="/saved">Saved Gigs</Link>
                  <span className="link" onClick={handleLogout}>Logout</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="link" to="/login">Login</Link>
              <Link className="link" to="/register">
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
              {/* First set of menu items */}
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
                <Link className="link menuLink" key={path} to={`/gigs?cat=${path}`}>
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