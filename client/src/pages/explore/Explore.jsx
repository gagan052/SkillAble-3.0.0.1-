import React, { useEffect, useState, useCallback } from "react";
import "./Explore.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";

function Explore() {
  const [page, setPage] = useState(0);
  const { search } = useLocation();
  
  // Fetch gigs with infinite scrolling
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    status 
  } = useInfiniteQuery({
    queryKey: ["explore-gigs"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await newRequest.get(`/gigs?page=${pageParam}&limit=9`);
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length : undefined;
    },
  });

  // Handle scroll event for infinite scrolling
  const handleScroll = useCallback(() => {
    // Check if we're near the bottom of the page
    if (
      window.innerHeight + document.documentElement.scrollTop >= 
      document.documentElement.offsetHeight - 300 &&
      hasNextPage && 
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Flatten the pages data for rendering
  const gigs = data?.pages.flatMap((page) => page) || [];

  return (
    <div className="explore-page">
      <div className="container">
        <h1>Explore Gigs</h1>
        <p className="para">
          Discover amazing services from talented freelancers around the world
        </p>
        
        {status === "loading" ? (
          <div className="loading">Loading gigs...</div>
        ) : status === "error" ? (
          <div className="error">Error loading gigs</div>
        ) : (
          <>
            <div className="cards">
              {gigs.map((gig) => <GigCard key={gig._id} item={gig} />)}
            </div>
            
            {isFetchingNextPage && (
              <div className="loading-more">Loading more gigs...</div>
            )}
            
            {!hasNextPage && gigs.length > 0 && (
              <div className="end-message">You've seen all available gigs</div>
            )}
            
            {gigs.length === 0 && (
              <div className="no-gigs">No gigs found</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Explore;