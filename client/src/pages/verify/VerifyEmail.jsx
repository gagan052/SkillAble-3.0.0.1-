import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./VerifyEmail.scss";

function VerifyEmail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await newRequest.post("/auth/verify-email", { userId, otp });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    setLoading(true);

    try {
      await newRequest.post("/auth/resend-otp", { userId, type: "email" });
      setSuccess(false);
      setOtp("");
      alert("A new verification code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-email">
      <div className="container">
        <h1>Verify Your Email</h1>
        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Email Verified Successfully!</h2>
            <p>Redirecting you to login page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p>
              We've sent a verification code to your email address. Please enter
              the code below to verify your account.
            </p>
            <div className="otp-input">
              <input
                type="text"
                placeholder="Enter verification code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="verify-btn">
              {loading ? "Verifying..." : "Verify Email"}
            </button>
            <div className="resend">
              <p>
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="resend-btn"
                >
                  Resend
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;