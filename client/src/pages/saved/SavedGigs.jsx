import React from "react";
import "./SavedGigs.scss";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { SkeletonOrder } from "../../components/skeletonLoader/SkeletonLoader";

function SavedGigs() {
  const { isLoading, error, data } = useQuery({
    queryKey: ["savedGigs"],
    queryFn: async () => {
      try {
        const response = await newRequest.get("/saved-gigs");
        const responseData = response.data;
        
        // If response is already an array, return it
        if (Array.isArray(responseData)) {
          return responseData;
        }
        
        // If response has a 'gigs' property that is an array, return that
        if (responseData && responseData.gigs && Array.isArray(responseData.gigs)) {
          return responseData.gigs;
        }
        
        // Try to find any array property in the response
        if (responseData && typeof responseData === 'object') {
          const arrayProps = Object.keys(responseData).filter(key => Array.isArray(responseData[key]));
          if (arrayProps.length > 0) {
            return responseData[arrayProps[0]];
          }
        }
        
        // If we can't find a valid gigs array, return empty array
        return [];
      } catch (err) {
        console.error("Error fetching saved gigs:", err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Query to fetch user data for each gig
  const fetchUserData = (userId) => {
    return useQuery({
      queryKey: ["user", userId],
      queryFn: () => newRequest.get(`/users/${userId}`).then((res) => res.data),
      enabled: !!userId,
      staleTime: 1000 * 60 * 5, // Cache user data for 5 minutes
    });
  };

  return (
    <div className="savedGigs">
      <div className="container">
        <div className="title">
          <h1>Saved Gigs</h1>
        </div>
        
        {isLoading ? (
          <div className="skeleton-orders">
            {Array(5).fill(0).map((_, index) => (
              <SkeletonOrder key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="error">
            <h3>Error loading saved gigs</h3>
            <p>{error.response?.data?.message || error.message || "Something went wrong!"}</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="empty">
            <img src="/img/empty.png" alt="No saved gigs" />
            <h3>You haven't saved any gigs yet</h3>
            <p>Start exploring and save your favorite gigs!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Seller</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) && data.map((gig) => (
                <tr key={gig._id}>
                  <td>
                    <img className="image" src={gig.cover || "/img/noimage.jpg"} alt="" />
                  </td>
                  <td>
                    <Link to={`/gig/${gig._id}`} className="link">
                      {gig.title}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/profile/${gig.userId}`} className="link">
                      {gig.username || "Seller"}
                    </Link>
                  </td>
                  <td>${gig.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SavedGigs;