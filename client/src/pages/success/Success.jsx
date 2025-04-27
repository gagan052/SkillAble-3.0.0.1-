import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Success.scss";

const Success = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const payment_intent = params.get("payment_intent");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const makeRequest = async () => {
      try {
        await newRequest.put("/orders", { payment_intent });
        
        // Countdown timer
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate("/orders");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      } catch (err) {
        console.log(err);
      }
    };

    makeRequest();
  }, [navigate, payment_intent]);

  return (
    <div className="success">
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Your order has been confirmed and is being processed.</p>
        <p>You will receive a confirmation email shortly.</p>
        <div className="redirect-message">
          You will be redirected to your orders in {countdown} seconds
          <span className="spinner"></span>
        </div>
        <button className="back-button" onClick={() => navigate("/orders")}>
          Go to Orders
        </button>
      </div>
    </div>
  );
};

export default Success;
