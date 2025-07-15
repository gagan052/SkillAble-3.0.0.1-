import React, { useState } from "react";
import "./Contact.scss";
import Footer from "../../components/footer/Footer";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub } from "react-icons/fa";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Please fill out all required fields."
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Please enter a valid email address."
      });
      return;
    }

    // In a real application, you would send the form data to a server here
    // For now, we'll just simulate a successful submission
    setFormStatus({
      submitted: true,
      error: false,
      message: "Thank you for your message! We'll get back to you soon."
    });

    // Reset form after successful submission
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="contact">
      <div className="container">
        <h1>Contact Us</h1>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>
              Have questions about SkillAble? Want to partner with us? Or just want to say hello? 
              We'd love to hear from you! Reach out using any of the methods below.
            </p>
            
            <div className="info-item">
              <FaEnvelope className="icon" />
              <div>
                <h3>Email</h3>
                <p><a href="mailto:contact@skillable.com">contact@skillable.com</a></p>
                <p><a href="mailto:support@skillable.com">support@skillable.com</a></p>
              </div>
            </div>
            
            <div className="info-item">
              <FaPhone className="icon" />
              <div>
                <h3>Phone</h3>
                <p><a href="tel:+919728422008">+91 9728422008</a></p>
                <p>Monday-Friday, 9:00 AM - 6:00 PM IST</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaMapMarkerAlt className="icon" />
              <div>
                <h3>Address</h3>
                <p>SkillAble Headquarters</p>
                <p>Rose Garden</p>
                <p>Ambala city, Haryana 134007</p>
                <p>India</p>
              </div>
            </div>
            
            <div className="social-links">
              <h3>Connect With Us</h3>
              <div className="social-icons">
                <a href="https://www.linkedin.com/in/gagan-saini-90b2a71b0/" target="_blank" rel="noreferrer">
                  <FaLinkedin className="social-icon" />
                </a>
                <a href="https://github.com/gagan052" target="_blank" rel="noreferrer">
                  <FaGithub className="social-icon" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="contact-form">
            <h2>Send Us a Message</h2>
            {formStatus.submitted ? (
              <div className="success-message">
                <p>{formStatus.message}</p>
                <button onClick={() => setFormStatus({ submitted: false, error: false, message: "" })}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {formStatus.error && <div className="error-message">{formStatus.message}</div>}
                
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="5" 
                    value={formData.message} 
                    onChange={handleChange} 
                    required 
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            )}
          </div>
        </div>
        
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3>How do I create an account on SkillAble?</h3>
            <p>
              Creating an account is easy! Simply click on the "Join" button in the top right corner of our homepage, 
              or visit our <a href="/register">registration page</a>. Follow the prompts to set up your profile.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>
              SkillAble accepts various payment methods including credit/debit cards, PayPal, and bank transfers. 
              All payments are processed securely through our trusted payment gateways.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>How do I become a seller on SkillAble?</h3>
            <p>
              To become a seller, you need to create an account and complete your profile. Then, click on "Become a Seller" 
              in your dashboard and follow the steps to set up your services and gigs.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>What fees does SkillAble charge?</h3>
            <p>
              SkillAble charges a 15% commission on completed orders. This fee covers platform maintenance, 
              payment processing, marketing, and customer support services.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Contact;