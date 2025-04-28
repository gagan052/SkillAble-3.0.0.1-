import React from "react";
import "./SavedGigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function SavedGigs() {
  const { isLoading, error, data } = useQuery({
    queryKey: ["savedGigs"],
    queryFn: () =>
      newRequest.get("/saved-gigs").then((res) => {
        return res.data;
      }),
    retry: false,
  });

  return (
    <div className="savedGigs">
      <div className="container">
        <h1>Saved Gigs</h1>
        <p>Your collection of saved gigs</p>
        <div className="cards">
          {isLoading ? (
            <div className="loading">Loading your saved gigs...</div>
          ) : error ? (
            <div className="error">
              {error.response?.data || "Something went wrong!"}
            </div>
          ) : data?.length === 0 ? (
            <div className="empty">
              <img src="/img/empty.png" alt="No saved gigs" />
              <h3>You haven't saved any gigs yet</h3>
              <p>Start exploring and save your favorite gigs!</p>
            </div>
          ) : (
            data?.map((gig) => <GigCard key={gig._id} item={gig} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default SavedGigs;