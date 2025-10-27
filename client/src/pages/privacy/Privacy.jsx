import React from "react";
import "./Privacy.scss";
import Footer from "../../components/footer/Footer";

function Privacy() {
  return (
    <div className="privacy">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p>Last updated: June 2023</p>
        
        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to DevXcom. We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you about how we look after your personal data when you visit our website
            and tell you about your privacy rights and how the law protects you.
          </p>
        </section>
        
        <section>
          <h2>2. The Data We Collect About You</h2>
          <p>
            Personal data means any information about an individual from which that person can be identified.
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped as follows:
          </p>
          <ul>
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
            <li><strong>Profile Data</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
          </ul>
        </section>
        
        <section>
          <h2>3. How We Use Your Personal Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>
        </section>
        
        <section>
          <h2>4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
            We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </section>
        
        <section>
          <h2>5. Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
          </p>
          <ul>
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing your personal data</li>
            <li>Request transfer of your personal data</li>
            <li>Right to withdraw consent</li>
          </ul>
        </section>
        
        <section>
          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <p>Email: gagansaini64593@gmail.com</p>
          <p>Address: Rose garden, Ambala city, Haryana, India</p>
        </section>
      </div>
      
    </div>
  );
}

export default Privacy;