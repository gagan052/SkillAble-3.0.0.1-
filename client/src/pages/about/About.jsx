import React from "react";
import "./About.scss";
import Footer from "../../components/footer/Footer";

function About() {
  return (
    <div className="about">
      <div className="container">
        <h1>About SkillAble</h1>
        
        <section className="mission">
          <h2>Our Mission</h2>
          <p>
            At SkillAble, we're on a mission to revolutionize the freelancing landscape by creating a platform that empowers skilled professionals and connects them with clients seeking quality services. We believe in fostering a community where talent is recognized, valued, and fairly compensated.
          </p>
        </section>
        
        <section className="story">
          <h2>Our Story</h2>
          <p>
            Founded in 2023 by Gagan Saini, SkillAble emerged from the recognition that traditional freelancing platforms often fall short in providing a balanced ecosystem for both service providers and clients. With a background in software development and a passion for creating meaningful digital experiences, Gagan set out to build a platform that addresses these challenges.
          </p>
          <p>
            What started as a small project has grown into a vibrant marketplace connecting thousands of freelancers with clients worldwide. Our journey has been marked by continuous innovation, user-centric design, and a commitment to ethical business practices.
          </p>
        </section>
        
        <section className="team">
          <h2>Our Team</h2>
          <div className="team-member">
            <h3>Gagan Saini</h3>
            <p className="title">Founder & CEO</p>
            <p className="bio">
              A passionate developer and entrepreneur with a vision to transform the freelancing industry. Gagan brings extensive experience in web development and a deep understanding of the challenges faced by freelancers in today's digital economy.
            </p>
            <p className="contact">
              <a href="https://www.linkedin.com/in/gagan-saini-90b2a71b0/" target="_blank" rel="noreferrer">LinkedIn</a> | 
              <a href="https://github.com/gagan052" target="_blank" rel="noreferrer">GitHub</a>
            </p>
          </div>
        </section>
        
        <section className="values">
          <h2>Our Values</h2>
          <ul>
            <li>
              <h3>Transparency</h3>
              <p>We believe in clear, honest communication between all parties on our platform.</p>
            </li>
            <li>
              <h3>Quality</h3>
              <p>We prioritize excellence in service delivery and platform functionality.</p>
            </li>
            <li>
              <h3>Fairness</h3>
              <p>We strive to create equitable opportunities for freelancers and reasonable rates for clients.</p>
            </li>
            <li>
              <h3>Innovation</h3>
              <p>We continuously evolve our platform to meet the changing needs of our users.</p>
            </li>
            <li>
              <h3>Community</h3>
              <p>We foster a supportive environment where professionals can grow and thrive.</p>
            </li>
          </ul>
        </section>
        
        <section className="join-us">
          <h2>Join Our Journey</h2>
          <p>
            Whether you're a freelancer looking to showcase your skills or a client seeking quality services, SkillAble offers a platform designed with your needs in mind. Join us in building a future where freelancing is accessible, rewarding, and impactful.
          </p>
          <div className="cta-buttons">
            <a href="/register" className="register-btn">Sign Up Today</a>
            <a href="/contact" className="contact-btn">Contact Us</a>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default About;