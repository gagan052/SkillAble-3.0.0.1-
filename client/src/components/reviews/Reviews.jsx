import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
import "./Reviews.scss";
const Reviews = ({ gigId, gigUserId }) => {
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [hasReviewed, setHasReviewed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const queryClient = useQueryClient()
  const { isLoading, error, data } = useQuery({
    queryKey: ["reviews", gigId],
    queryFn: () =>
      newRequest.get(`/reviews/${gigId}`).then((res) => {
        // Check if current user has already reviewed this gig
        if (currentUser) {
          const userReview = res.data.find(review => review.userId === currentUser._id);
          setHasReviewed(!!userReview);
        }
        return res.data;
      }),
    enabled: !!gigId,
  });

  const mutation = useMutation({
    mutationFn: (review) => {
      return newRequest.post("/reviews", review);
    },
    onSuccess:()=>{
      queryClient.invalidateQueries(["reviews", gigId])
    },
    onError: (error) => {
      console.error("Review submission error:", error);
      // Handle specific error cases
      if (error.response?.status === 403) {
        setErrorMessage(error.response.data?.message || "You are not allowed to review this gig. You might have already reviewed it or don't have permission.");
      } else {
        setErrorMessage("Error submitting review: " + (error.response?.data?.message || error.message || "Unknown error"));
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = e.target[0].value;
    const star = e.target[1].value;
    
    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");
    
    // Validate input
    if (!desc.trim()) {
      setErrorMessage("Please write a review before submitting");
      return;
    }
    
    // Disable form during submission
    e.target.querySelector('button').disabled = true;
    
    mutation.mutate({ gigId, desc, star }, {
      onSuccess: () => {
        // Reset form
        e.target.reset();
        setSuccessMessage("Review submitted successfully!");
      },
      onSettled: () => {
        // Re-enable button
        e.target.querySelector('button').disabled = false;
      }
    });
  };

  return (
    <div className="reviews">
      <h2>Reviews</h2>
      {isLoading ? (
        <div className="loading">Loading reviews...</div>
      ) : error ? (
        <div className="error">
          <p>Something went wrong! {error.message}</p>
        </div>
      ) : !data || !Array.isArray(data) || data.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to leave a review!</p>
        </div>
      ) : (
        data.map((review) => <Review key={review._id} review={review} />)
      )}
      <div className="add">
        <h3>Add a review</h3>
        {!currentUser ? (
          <div className="login-prompt">
            <p>Please log in to leave a review</p>
          </div>
        ) : currentUser._id === gigUserId ? (
          <div className="own-gig-message">
            <p>You cannot review your own gig</p>
          </div>
        ) : hasReviewed ? (
          <div className="already-reviewed-message">
            <p>You have already reviewed this gig</p>
          </div>
        ) : (
          <>
            {errorMessage && <div className="error">{errorMessage}</div>}
            {successMessage && <div className="success">{successMessage}</div>}
            <form action="" className="addForm" onSubmit={handleSubmit}>
              <input type="text" placeholder="write your opinion" />
              <select name="" id="" defaultValue={5}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
              <button disabled={mutation.isLoading}>
                {mutation.isLoading ? "Submitting..." : "Send"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;
