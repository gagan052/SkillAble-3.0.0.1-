import React, { useEffect, useState, useCallback } from "react";
import "./Explore.scss";
import GigCard from "../../components/gigCard/GigCard";
import Stories from "../../components/stories/Stories";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";

function Explore() {
  const { search } = useLocation();
  const queryClient = useQueryClient();
  
  // Fetch gigs with infinite scrolling
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    status 
  } = useInfiniteQuery({
    queryKey: ["explore-gigs", search],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await newRequest.get(`/gigs?page=${pageParam}&limit=9${search ? `&${search.substring(1)}` : ''}`);
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      // Only return next page if the last page has items
      return lastPage.length > 0 ? allPages.length : undefined;
    },
  });

  // Handle scroll event for infinite scrolling
  const handleScroll = useCallback(() => {
    // Check if we're near the bottom of the page
    const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
    const scrollThreshold = document.documentElement.offsetHeight - 300;
    
    if (
      scrollPosition >= scrollThreshold &&
      hasNextPage && 
      !isFetchingNextPage
    ) {
      console.log('Fetching next page of gigs...');
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Add scroll event listener
  useEffect(() => {
    console.log('Setting up scroll event listener');
    window.addEventListener("scroll", handleScroll);
    
    // Initial check in case the page isn't tall enough to scroll
    if (window.innerHeight >= document.documentElement.offsetHeight && hasNextPage) {
      console.log('Page not tall enough to scroll, loading next page automatically');
      fetchNextPage();
    }
    
    return () => {
      console.log('Removing scroll event listener');
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, fetchNextPage, hasNextPage]);

  // Flatten the pages data for rendering
  const gigs = data?.pages.flatMap((page) => page) || [];
  
  // Debug logging
  useEffect(() => {
    if (data) {
      console.log('Explore data updated:', { 
        pagesCount: data.pages.length,
        totalGigs: gigs.length,
        hasNextPage
      });
    }
  }, [data, gigs.length, hasNextPage]);
  
  // Refetch when search params change
  useEffect(() => {
    console.log('Search params changed, refetching data');
    // Reset query cache when search parameters change
    queryClient.invalidateQueries(["explore-gigs", search]);
  }, [search, queryClient]);

  return (
    <div className="explore-page">
      <div className="container">
        {/* Stories Section */}
        <div className="stories-section">
          <h2>Recent Stories</h2>
          <Stories />
        </div>
        
        <h1>Explore Gigs</h1>
        <p className="para">
          Discover amazing services from talented freelancers around the world
        </p>
        
        {status === "loading" ? (
          <div className="loading">Loading gigs...</div>
        ) : status === "error" ? (
          <div className="error">Error loading gigs. Please try again later.</div>
        ) : (
          <>
            {gigs.length > 0 ? (
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
              </>
            ) : (
              <div className="no-gigs">No gigs found. Try different search criteria.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Explore;