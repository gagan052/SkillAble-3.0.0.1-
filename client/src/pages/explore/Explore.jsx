import React, { useEffect, useState, useCallback } from "react";
import "./Explore.scss";
import GigCard from "../../components/gigCard/GigCard";
import Stories from "../../components/stories/Stories";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";
import { SkeletonCard, SkeletonExploreFilters } from "../../components/skeletonLoader/SkeletonLoader";

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
      try {
        const res = await newRequest.get(`/gigs?page=${pageParam}&limit=9${search ? `&${search.substring(1)}` : ''}`);
        if (!res.data) throw new Error("No data in response");
        // Rest of your logic...
        console.log('API response:', res.data);
        console.log('API response type:', typeof res.data, Array.isArray(res.data) ? '(array)' : '(not array)');
        
        // Handle different API response formats
        if (Array.isArray(res.data)) {
          console.log('API returned array of gigs directly');
          return res.data;
        } else if (res.data && res.data.gigs && Array.isArray(res.data.gigs)) {
          console.log('Gigs found in response object:', res.data.gigs.length);
          return res.data;
        } else if (res.data && typeof res.data === 'object') {
          // If we can't find a gigs property but the response is an object,
          // check if the object itself might be a single gig or contains gig-like objects
          console.log('Examining response object for gig-like data');
          const keys = Object.keys(res.data);
          console.log('Response object keys:', keys);
          
          // If this appears to be a single gig, wrap it in an object with gigs array
          if (res.data._id && (res.data.title || res.data.desc)) {
            console.log('Response appears to be a single gig, wrapping in array');
            return { gigs: [res.data], page: pageParam, totalPages: pageParam + 1 };
          }
        }
        
        // Default fallback - return data as is
        return res.data;
        
      } catch (error) {
        console.error("Error fetching gigs:", error);
        throw error;
      }
    },
    
    // queryFn: async ({ pageParam = 0 }) => {
    //   const res = await newRequest.get(`/gigs?page=${pageParam}&limit=9${search ? `&${search.substring(1)}` : ''}`);
    //   console.log('API response:', res.data);
    //   console.log('API response type:', typeof res.data, Array.isArray(res.data) ? '(array)' : '(not array)');
      
    //   // Handle different API response formats
    //   if (Array.isArray(res.data)) {
    //     console.log('API returned array of gigs directly');
    //     return res.data;
    //   } else if (res.data && res.data.gigs && Array.isArray(res.data.gigs)) {
    //     console.log('Gigs found in response object:', res.data.gigs.length);
    //     return res.data;
    //   } else if (res.data && typeof res.data === 'object') {
    //     // If we can't find a gigs property but the response is an object,
    //     // check if the object itself might be a single gig or contains gig-like objects
    //     console.log('Examining response object for gig-like data');
    //     const keys = Object.keys(res.data);
    //     console.log('Response object keys:', keys);
        
    //     // If this appears to be a single gig, wrap it in an object with gigs array
    //     if (res.data._id && (res.data.title || res.data.desc)) {
    //       console.log('Response appears to be a single gig, wrapping in array');
    //       return { gigs: [res.data], page: pageParam, totalPages: pageParam + 1 };
    //     }
    //   }
      
    //   // Default fallback - return data as is
    //   return res.data;
    // },
    getNextPageParam: (lastPage, allPages) => {
      // Check if there are more pages based on the pagination info
      if (!lastPage) return undefined;
      
      // Handle both array and object with gigs property response formats
      if (Array.isArray(lastPage)) {
        // If API returns an array directly
        return allPages.length < 10 ? allPages.length : undefined; // Simple pagination limit
      } else if (lastPage.gigs) {
        // If API returns an object with pagination info
        return lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined;
      }
      
      return undefined;
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

  // Extract gigs from the response and flatten the pages data for rendering
  const gigs = data?.pages.flatMap((page) => {
    // Handle different API response formats
    if (Array.isArray(page)) {
      return page; // If API returns array of gigs directly
    } else if (page && page.gigs && Array.isArray(page.gigs)) {
      return page.gigs; // If API returns object with gigs property
    } else if (page && typeof page === 'object') {
      // If the API returns an object without a gigs property, try to extract gig-like objects
      const possibleGigs = Object.values(page).filter(item => 
        item && typeof item === 'object' && item._id && 
        (item.title || item.desc || item.userId)
      );
      if (possibleGigs.length > 0) return possibleGigs;
    }
    console.log('Could not extract gigs from page:', page);
    return [];
  }) || [];
  
  // Log the extracted gigs for debugging
  useEffect(() => {
    if (gigs.length > 0) {
      console.log('Extracted gigs:', gigs.slice(0, 3));
      // Verify that gigs have the required properties for rendering
      const validGigs = gigs.filter(gig => gig && gig._id && (gig.title || gig.desc));
      if (validGigs.length !== gigs.length) {
        console.warn('Some gigs may be missing required properties:', 
          gigs.length - validGigs.length, 'invalid gigs found');
      }
    } else {
      console.log('No gigs extracted from API response');
    }
  }, [gigs]);
  
  // Debug logging
  useEffect(() => {
    if (data) {
      console.log('Explore data updated:', { 
        pagesCount: data.pages.length,
        totalGigs: gigs.length,
        hasNextPage,
        firstPageData: data.pages[0]
      });
      
      // Log detailed structure of first page to understand format
      const firstPage = data.pages[0];
      if (firstPage) {
        console.log('First page structure:', {
          isArray: Array.isArray(firstPage),
          hasGigsProperty: !Array.isArray(firstPage) && 'gigs' in firstPage,
          keys: Object.keys(firstPage),
          gigsCount: Array.isArray(firstPage) ? firstPage.length : 
                    (firstPage.gigs ? firstPage.gigs.length : 'no gigs property')
        });
      }
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
          <>
            <SkeletonExploreFilters />
            <div className="skeleton-grid">
              {Array(9).fill().map((_, index) => (
                <SkeletonCard key={index} height="300px" />
              ))}
            </div>
          </>
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
                  <div className="skeleton-grid" style={{ marginTop: "20px" }}>
                    {Array(3).fill().map((_, index) => (
                      <SkeletonCard key={index} height="300px" />
                    ))}
                  </div>
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