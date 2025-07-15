import React, { useState } from "react";
import "./Footer.scss";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function Footer() {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionName) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  return (
    <div className="footer">
      <div className="container">
        <div className="top">
          <div className="item">
            <h2 onClick={() => toggleSection('categories')} className="mobile-dropdown-header">
              Categories
              <span className="mobile-dropdown-icon">
                {openSections.categories ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </h2>
            <div className={`mobile-dropdown-content ${openSections.categories ? 'open' : ''}`}>
              <span>Graphics & Design</span>
              <span>Digital Marketing</span>
              <span>Writing & Translation</span>
              <span>Video & Animation</span>
              <span>Music & Audio</span>
              <span>Programming & Tech</span>
              <span>Data</span>
              <span>Business</span>
              <span>Lifestyle</span>
              <span>Photography</span>
              <span>Sitemap</span>
            </div>
          </div>
          <div className="item">
            <h2 onClick={() => toggleSection('about')} className="mobile-dropdown-header">
              About
              <span className="mobile-dropdown-icon">
                {openSections.about ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </h2>
            <div className={`mobile-dropdown-content ${openSections.about ? 'open' : ''}`}>
              <span><a href="/about">About Us</a></span>
              <span>Press & News</span>
              <span>Partnerships</span>
              <span><a href="/privacy">Privacy Policy</a></span>
              <span>Terms of Service</span>
              <span>Intellectual Property Claims</span>
              <span>Investor Relations</span>
              <span><a href="/contact">Contact Us</a></span>
            </div>
          </div>
          <div className="item">
            <h2 onClick={() => toggleSection('support')} className="mobile-dropdown-header">
              Support
              <span className="mobile-dropdown-icon">
                {openSections.support ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </h2>
            <div className={`mobile-dropdown-content ${openSections.support ? 'open' : ''}`}>
              <span>Help & Support</span>
              <span>Trust & Safety</span>
              <span>Selling on SkillAble</span>
              <span>Buying on SkillAble</span>
              <span><a href="/contact">Contact Support</a></span>
            </div>
          </div>
          <div className="item">
            <h2 onClick={() => toggleSection('community')} className="mobile-dropdown-header">
              Community
              <span className="mobile-dropdown-icon">
                {openSections.community ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </h2>
            <div className={`mobile-dropdown-content ${openSections.community ? 'open' : ''}`}>
              <span>Customer Success Stories</span>
              <span>Community hub</span>
              <span>Forum</span>
              <span>Events</span>
              <span>Blog</span>
              <span>Influencers</span>
              <span>Affiliates</span>
              <span>Podcast</span>
              <span>Invite a Friend</span>
              <span>Become a Seller</span>
              <span>Community Standards</span>
            </div>
          </div>
          <div className="item">
            <h2 onClick={() => toggleSection('more')} className="mobile-dropdown-header">
              More From SkillAble
              <span className="mobile-dropdown-icon">
                {openSections.more ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </h2>
            <div className={`mobile-dropdown-content ${openSections.more ? 'open' : ''}`}>
              <span>SkillAble Business</span>
              <span>SkillAble Pro</span>
              <span>SkillAble Logo Maker</span>
              <span>SkillAble Guides</span>
              <span>Get Inspired</span>
              <span>SkillAble Select</span>
              <span>ClearVoice</span>
              <span>SkillAble Workspace</span>
              <span>Learn</span>
              <span>Working Not Working</span>
            </div>
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <h2>SkillAble</h2>
            <span>© SkillAble International Ltd. 2025</span>
          </div>
          <div className="right">
            <div className="social">
              <img src="/img/twitter.png" alt="Twitter" />
              <img src="/img/facebook.png" alt="Facebook" />
              <a href="https://www.linkedin.com/in/gagan-saini-90b2a71b0/" target="_blank" rel="noreferrer">
                <img src="/img/linkedin.png" alt="LinkedIn" />
              </a>
              <img src="/img/pinterest.png" alt="Pinterest" />
              <img src="/img/instagram.png" alt="Instagram" />
              <a href="https://github.com/gagan052" target="_blank" rel="noreferrer">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" style={{width: "24px", height: "24px"}} />
              </a>
            </div>
            <div className="link">
              <img src="/img/language.png" alt="" />
              <span>English</span>
            </div>
            <div className="link">
              <img src="/img/coin.png" alt="" />
              <span>USD</span>
            </div>
            <img src="/img/accessibility.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
