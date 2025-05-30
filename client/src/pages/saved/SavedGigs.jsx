import React, { useEffect } from "react";
import "./SavedGigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function SavedGigs() {
  const { isLoading, error, data } = useQuery({
    queryKey: ["savedGigs"],
    queryFn: async () => {
      try {
        console.log("Fetching saved gigs");
        const response = await newRequest.get("/saved-gigs");
        
        // Log the raw response
        console.log("API Response:", response);
        
        // Handle different response formats
        const responseData = response.data;

        
        // If response is already an array, return it
        if (Array.isArray(responseData)) {
          console.log("Response is an array with", responseData.length, "items");
          return responseData;
        }
        console.log("SAVED Gigs data:", responseData);

        
        // If response has a 'gigs' property that is an array, return that
        if (responseData && responseData.gigs && Array.isArray(responseData.gigs)) {
          console.log("Found gigs in response object:", responseData.gigs.length);
          return responseData.gigs;
        }
        
        // Try to find any array property in the response
        if (responseData && typeof responseData === 'object') {
          console.log("Response is an object with keys:", Object.keys(responseData));
          const arrayProps = Object.keys(responseData).filter(key => Array.isArray(responseData[key]));
          if (arrayProps.length > 0) {
            console.log("Found array in property", arrayProps[0], "with", responseData[arrayProps[0]].length, "items");
            return responseData[arrayProps[0]];
          }
        }
        
        // If we can't find a valid gigs array, log error and return empty array
        console.error("Could not find gigs array in response:", responseData);
        return [];
      } catch (err) {
        console.error("Error fetching saved gigs:", err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
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
              <h3>Error loading saved gigs</h3>
              <p>{error.response?.data?.message || error.message || "Something went wrong!"}</p>
              <p>Please check the console for more details.</p>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="empty">
              <img src="/img/empty.png" alt="No saved gigs" />
              <h3>You haven't saved any gigs yet</h3>
              <p>Start exploring and save your favorite gigs!</p>
            </div>
          ) : (
            Array.isArray(data) && data.map((gig) => <GigCard key={gig._id} item={gig} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default SavedGigs;