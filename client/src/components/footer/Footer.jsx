import React from "react";
import "./Footer.scss";

function Footer() {
  return (
    <div className="footer">
      <div className="container">
        <div className="top">
          <div className="item">
            <h2>Categories</h2>
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
          <div className="item">
            <h2>About</h2>
            <span>Press & News</span>
            <span>Partnerships</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Intellectual Property Claims</span>
            <span>Investor Relations</span>
            <span>Contact Sales</span>
          </div>
          <div className="item">
            <h2>Support</h2>
            <span>Help & Support</span>
            <span>Trust & Safety</span>
            <span>Selling on SkillAble</span>
            <span>Buying on SkillAble</span>
          </div>
          <div className="item">
            <h2>Community</h2>
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
          <div className="item">
            <h2>More From SkillAble</h2>
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
