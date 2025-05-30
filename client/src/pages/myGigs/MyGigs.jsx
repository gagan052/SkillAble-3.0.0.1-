import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyGigs.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MyGigs() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Redirect to login if no user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs"],
    queryFn: async () => {
      if (!currentUser) return null;
      try {
        // Add debug logging for the request
        console.log("Fetching gigs for user ID:", currentUser._id);
        const response = await newRequest.get(`/gigs?userId=${currentUser._id}`);
        
        // Log the raw response
        console.log("API Response:", response);
        
        // Handle different response formats
        const responseData = response.data;
        
        // If response is already an array, return it
        if (Array.isArray(responseData)) {
          return responseData;
        }
        
        // If response has a 'gigs' property that is an array, return that
        if (responseData && responseData.gigs && Array.isArray(responseData.gigs)) {
          console.log("Found gigs in response object:", responseData.gigs.length);
          return responseData.gigs;
        }
        
        // If we can't find a valid gigs array, log error and return empty array
        console.error("Could not find gigs array in response:", responseData);
        return [];
      } catch (err) {
        console.error("Error fetching gigs:", err);
        throw err;
      }
    },
    enabled: !!currentUser,
  });

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/gigs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  const handleDelete = (id) => {
    mutation.mutate(id);
  };

  // Debug log to check data structure
  console.log("MyGigs data:", data);
  console.log("Current user:", currentUser);
  console.log("API base URL:", import.meta.env.VITE_API_BASE_URL);

  // Check if the API is properly configured
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_BASE_URL + 'gigs');
        console.log('API connection test:', response.status, response.statusText);
      } catch (err) {
        console.error('API connection test failed:', err);
      }
    };
    
    checkApiConnection();
  }, []);

  return (
    <div className="myGigs">
      {isLoading ? (
        <div className="loading">Loading your gigs...</div>
      ) : error ? (
        <div className="error">
          <h3>Error loading gigs</h3>
          <p>{error.response?.data?.message || error.message || "Something went wrong!"}</p>
          <p>Please check the console for more details.</p>
        </div>
      ) : (
        <div className="container">
          <div className="title">
            <h1>Gigs</h1>
            {currentUser?.isSeller && (
              <Link to="/add">
                <button>Add New Gig</button>
              </Link>
            )}
          </div>
          
          {/* Debug information */}
          {/* <div className="debug-info" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
            <p><strong>User ID:</strong> {currentUser?._id || 'Not available'}</p>
            <p><strong>Is Seller:</strong> {currentUser?.isSeller ? 'Yes' : 'No'}</p>
            <p><strong>Data received:</strong> {Array.isArray(data) ? `${data.length} gigs` : 'No data array'}</p>
          </div> */}
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Sales</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
            {Array.isArray(data) && data.length > 0 ? data.map((gig) => (
              <tr key={gig._id}>
                <td>
                  <img className="image" src={gig.cover} alt="" />
                </td>
                <td>{gig.title}</td>
                <td>{gig.price}</td>
                <td>{gig.sales}</td>
                <td>
                  <img
                    className="delete"
                    src="./img/delete.png"
                    alt=""
                    onClick={() => handleDelete(gig._id)}
                  />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{textAlign: "center"}}>
                  <div style={{ padding: '20px' }}>
                    <p style={{ marginBottom: '10px' }}>No gigs found. {currentUser?.isSeller ? "Create your first gig!" : ""}</p>
                    {currentUser?.isSeller && (
                      <Link to="/add">
                        <button style={{ backgroundColor: '#1dbf73', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px' }}>Create Gig</button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyGigs;
