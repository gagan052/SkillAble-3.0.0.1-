import React from "react";
import "./TeamSection.scss";

function TeamSection() {
  const teamMembers = [
    {
      id: 1,
      name: "Gagan Saini",
      role: "Project Owner & Full-Stack Developer",
      description: "Owner and developer of this project. Experienced full-stack developer with expertise in React, Node.js, and modern web technologies.",
      img: "/img/gagan-img.jpeg",
      social: {
        linkedin: "https://www.linkedin.com/in/gagan-saini-90b2a71b0/",
        github: "https://github.com/gagan052"
      }
    }
  ];

  return (
    <div className="team-section">
      <div className="container">
        <div className="title">
          <h1>About The Developer</h1>
          <p>The Creator and developer of this project</p>
        </div>
        <div className="team-members">
          <div className="team-card">
            <div className="member-img">
              <img src={teamMembers[0].img} alt={teamMembers[0].name} />
            </div>
            <div className="member-info">
              <h2>{teamMembers[0].name}</h2>
              <h3>{teamMembers[0].role}</h3>
              <p>{teamMembers[0].description}</p>
              <div className="social">
                {teamMembers[0].social.linkedin && (
                  <a href={teamMembers[0].social.linkedin} target="_blank" rel="noreferrer">
                    <img src="/img/linkedin.png" alt="LinkedIn" />
                  </a>
                )}
                {teamMembers[0].social.github && (
                  <a href={teamMembers[0].social.github} target="_blank" rel="noreferrer">
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamSection;