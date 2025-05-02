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
    queryFn: () => {
      if (!currentUser) return null;
      return newRequest.get(`/gigs?userId=${currentUser._id}`).then((res) => {
        // Ensure we always return an array
        const responseData = res.data;
        if (!Array.isArray(responseData)) {
          console.error("API did not return an array:", responseData);
          return [];
        }
        return responseData;
      });
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

  return (
    <div className="myGigs">
      {isLoading ? (
        <div className="loading">Loading your gigs...</div>
      ) : error ? (
        <div className="error">{error.response?.data || "Something went wrong!"}</div>
      ) : (
        <div className="container">
          <div className="title">
            <h1>Gigs</h1>
            {currentUser.isSeller && (
              <Link to="/add">
                <button>Add New Gig</button>
              </Link>
            )}
          </div>
          <table>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Sales</th>
              <th>Action</th>
            </tr>
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
                  No gigs found. {currentUser.isSeller ? "Create your first gig!" : ""}
                </td>
              </tr>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

export default MyGigs;
