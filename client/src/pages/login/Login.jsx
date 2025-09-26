import React, { useState } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await newRequest.post("/auth/login", { username, password });
      
      // Check if email verification is required
      if (res.data.requiresVerification) {
        setVerificationNeeded(true);
        setUserId(res.data.userId);
        return;
      }
      
      // Store the user info and token in localStorage
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      navigate("/");
    } catch (err) {
      // 确保错误信息是字符串而不是对象
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        setError(errorData.message || JSON.stringify(errorData));
      } else {
        setError(errorData || "Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        const userInfo = await userInfoResponse.json();
        
        // Login with Google
        const response = await newRequest.post('/auth/google', {
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          img: userInfo.picture
        });
        
        // Store user data in localStorage
        localStorage.setItem("currentUser", JSON.stringify(response.data));
        navigate("/");
      } catch (err) {
        // 确保错误信息是字符串而不是对象
        const errorData = err.response?.data;
        if (errorData && typeof errorData === 'object') {
          setError(errorData.message || JSON.stringify(errorData));
        } else {
          setError(errorData || "Error with Google authentication");
        }
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
    }
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleVerifyNow = () => {
    navigate(`/verify-email/${userId}`);
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        
        {verificationNeeded ? (
          <div className="verification-needed">
            <p>Your email needs to be verified before you can log in.</p>
            <button type="button" onClick={handleVerifyNow} className="verify-now-btn">
              Verify Now
            </button>
          </div>
        ) : (
          <>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />

            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
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
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            
            <div className="social-login">
              <p>Or sign in with</p>
              <button 
                type="button" 
                className="google-btn"
                onClick={handleGoogleLogin}
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
                  alt="Google logo" 
                />
                Sign in with Google
              </button>
            </div>
            
            <div className="register-link">
              <p>
                Don't have an account? <Link to="/register">Sign up</Link>
              </p>
            </div>
          </>
        )}
        
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

export default Login;
