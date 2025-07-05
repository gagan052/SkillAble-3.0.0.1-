import React, { useState } from "react";
import upload from "../../utils/upload";
import "./Register.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Register() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    img: "",
    country: "",
    isSeller: false,
    desc: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleSeller = (e) => {
    setUser((prev) => {
      return { ...prev, isSeller: e.target.checked };
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Basic validation
      if (!user.username || !user.email || !user.password || !user.country) {
        throw new Error("Please fill in all required fields");
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        throw new Error("Please enter a valid email address");
      }

      let url = "";
      if (file) {
        url = await upload(file);
      }

      await newRequest.post("/auth/register", {
        ...user,
        img: url,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register-container">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          
          <div className="form-sections">
            <div className="left">
              <div className="section-header">
                <h1>Create a new account</h1>
                <p>Join thousands of freelancers and clients on SkillAble</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="password-input-wrapper">
                  <input 
                    id="password"
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a strong password"
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Enter your country"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="profile-picture">Profile Picture</label>
                <div className="file-input-wrapper">
                  <input 
                    id="profile-picture"
                    type="file" 
                    onChange={(e) => setFile(e.target.files[0])}
                    accept="image/*"
                  />
                  <span className="file-input-text">
                    {file ? file.name : "Choose a profile picture"}
                  </span>
                </div>
              </div>
              
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
              
              <div className="login-link">
                <p>
                  Already have an account? <Link to="/login">Sign in</Link>
                </p>
              </div>
            </div>
            
            <div className="right">
              <div className="section-header">
                <h1>Become a Seller</h1>
                <p>Start offering your services to clients worldwide</p>
              </div>
              
              <div className="form-group">
                <div className="toggle-section">
                  <label htmlFor="seller-toggle">Activate seller account</label>
                  <label className="switch">
                    <input 
                      id="seller-toggle"
                      type="checkbox" 
                      onChange={handleSeller}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              
              {user.isSeller && (
                <>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 234 567 89"
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      placeholder="Tell us about yourself and your services..."
                      name="desc"
                      rows="6"
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
