import React, { useEffect, useRef, useState } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";
import { cards } from "../../data";

function Gigs() {
  const [sort, setSort] = useState("sales");
  const [open, setOpen] = useState(false);
  const minRef = useRef();
  const maxRef = useRef();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { search } = useLocation();
  
  // Extract category and search term from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(search);
    const category = params.get("cat");
    const searchTerm = params.get("search");
    
    if (category) {
      // Format category for display (replace underscores with spaces and capitalize)
      const formattedCategory = category
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setSelectedCategory(formattedCategory);
    } else if (searchTerm) {
      // If there's a search term but no category, show it as a custom category
      setSelectedCategory(`Search: ${searchTerm}`);
    } else {
      setSelectedCategory(null);
    }
    
    console.log("URL parameters:", { category, searchTerm });
  }, [search]);

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gigs", search],
    queryFn: async () => {
      try {
        // Initialize min and max values safely
        const min = minRef.current?.value || "";
        const max = maxRef.current?.value || "";
        
        // Create a new URLSearchParams object
        const params = new URLSearchParams();
        
        // Extract search params from the URL if they exist
        if (search) {
          // Remove the leading '?' if it exists
          const searchParams = new URLSearchParams(search.startsWith('?') ? search.substring(1) : search);
          // Copy all existing search params
          searchParams.forEach((value, key) => {
            params.append(key, value);
          });
        }
        
        // Add min, max and sort params
        if (min) params.append("min", min);
        if (max) params.append("max", max);
        params.append("sort", sort);
        // Set a higher limit to show all gigs (default is 10)
        params.append("limit", 100);
        
        // Construct the final query string
        const queryStr = `/gigs?${params.toString()}`;
        
        console.log("Fetching gigs with query:", queryStr);
        
        // Make the API request
        const res = await newRequest.get(queryStr);
        console.log("API response:", res);
        
        // Handle different response formats
        let gigsData = [];
        
        if (res && res.data) {
          // If response is already an array, use it directly
          if (Array.isArray(res.data)) {
            gigsData = res.data;
            console.log("Response is an array with", gigsData.length, "items");
          } 
          // If response is an object with a data property that's an array

          else if (typeof res.data === 'object') {
            if (Array.isArray(res.data.gigs)) {
              gigsData = res.data.gigs;
              console.log("Response has 'gigs' array with", gigsData.length, "items");
            } else if (res.data.data && Array.isArray(res.data.data)) {
              gigsData = res.data.data;
              console.log("Response has 'data' array with", gigsData.length, "items");
            } else {
              // try fallback
              const arrayProps = Object.keys(res.data).filter(key => Array.isArray(res.data[key]));
              
            }
          }
          

          // else if (typeof res.data === 'object' && res.data.data && Array.isArray(res.data.data)) {
          //   gigsData = res.data.data;
          //   console.log("Response has data property with", gigsData.length, "items");
          // }
          // If response is an object but not in the expected format
          else if (typeof res.data === 'object') {
            console.log("Response is an object with keys:", Object.keys(res.data));
            // Try to extract any array property from the response
            const arrayProps = Object.keys(res.data).filter(key => Array.isArray(res.data[key]));
            if (arrayProps.length > 0) {
              gigsData = res.data[arrayProps[0]];
              console.log("Found array in property", arrayProps[0], "with", gigsData.length, "items");
            } else {
              // If no array properties found, but the object has expected gig properties, wrap it in an array
              if (res.data._id && (res.data.title || res.data.desc)) {
                gigsData = [res.data];
                console.log("Single gig object found, converting to array");
              } else {
                console.warn("Could not find gigs data in response", res.data);
              }
            }
          }
        }
        
        console.log("Final processed gigs data:", gigsData);
        return gigsData || []; // Always return an array, even if empty
      } catch (err) {
        console.error("Error fetching gigs:", err);
        console.log("Error details:", err.response?.data || err.message);
        throw err; // Let React Query handle the error
      }
    },
    retry: 1, // Retry once if the request fails
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
  });

  // Debug log to check data structure and type
  useEffect(() => {
    if (data) {
      console.log("Data received:", data);
      console.log("Data type:", typeof data, Array.isArray(data) ? "(is array)" : "(not array)");
      console.log("Data length:", Array.isArray(data) ? data.length : 0);
      if (Array.isArray(data) && data.length > 0) {
        console.log("First gig sample:", data[0]);
      }
    }
  }, [data]);

  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  useEffect(() => {
    refetch();
  }, [sort]);

  const apply = () => {
    refetch();
  };

  // Find the matching card for the selected category to display its description
  const getCategoryInfo = () => {
    if (!selectedCategory) return { title: "All Categories", desc: "Explore all services available on our platform" };
    
    const matchingCard = cards.find(
      card => card.title.toLowerCase() === selectedCategory.toLowerCase()
    );
    
    return matchingCard || { 
      title: selectedCategory, 
      desc: `Explore our ${selectedCategory} services` 
    };
  };
  
  const categoryInfo = getCategoryInfo();

  return (
    <div className="gigs">
      <div className="container">
        <span className="breadcrumbs">SkillAble {selectedCategory ? `- ${selectedCategory} -` : ""}</span>
        <h1>{categoryInfo.title}</h1>
        <p className="para">
          {categoryInfo.desc}
        </p>
        <div className="menu">
          <div className="left">
            <span>Budget</span>
            <input ref={minRef} type="number" placeholder="min" />
            <input ref={maxRef} type="number" placeholder="max" />
            <button onClick={apply}>Apply</button>
          </div>
          <div className="right">
            <span className="sortBy">Sort by</span>
            <span className="sortType">
              {sort === "sales" ? "Best Selling" : "Newest"}
            </span>
            <img src="./img/down.png" alt="" onClick={() => setOpen(!open)} />
            {open && (
              <div className="rightMenu">
                {sort === "sales" ? (
                  <span onClick={() => reSort("createdAt")}>Newest</span>
                ) : (
                  <span onClick={() => reSort("sales")}>Best Selling</span>
                )}
                <span onClick={() => reSort("sales")}>Popular</span>
              </div>
            )}
          </div>
        </div>
        <div className="cards">


        
          {isLoading ? (
            <div className="loading">Loading gigs...</div>
          ) : error ? (
            <div className="error">
              <p>{error.response?.data?.message || error.message || "Something went wrong!"}</p>
              <button onClick={() => refetch()} className="retry-button">Retry</button>
            </div>
          ) : Array.isArray(data) && data.length > 0 ? (
            data.map((gig) => <GigCard key={gig._id} item={gig} />)
          ) : (
            <div className="no-results">
              <img src="/img/empty.png" alt="No gigs found" />
              <h3>No gigs found</h3>
              <p>Try adjusting your search or filters</p>
              <button onClick={() => refetch()} className="retry-button">Refresh</button>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}

export default Gigs;
