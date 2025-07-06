import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Messages.scss";
import moment from "moment";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const queryClient = useQueryClient();

  const [users, setUsers] = useState({});

  const { isLoading, error, data } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => {
        return res.data;
      }),
  });

  // Fetch user data for each conversation
  useEffect(() => {
    const fetchUsers = async () => {
      if (data) {
        const userMap = {};
        
        // Create an array of promises for all user fetch requests
        const promises = data.map(async (conversation) => {
          const userId = currentUser.isSeller ? conversation.buyerId : conversation.sellerId;
          
          try {
            const res = await newRequest.get(`/users/${userId}`);
            userMap[userId] = res.data;
          } catch (err) {
            console.error("Error fetching user:", err);
            userMap[userId] = { username: "Unknown User" };
          }
        });
        
        // Wait for all promises to resolve
        await Promise.all(promises);
        setUsers(userMap);
      }
    };
    
    fetchUsers();
  }, [data, currentUser]);

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  return (
    <div className="messages">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading conversations...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>Error loading conversations. Please try again later.</p>
        </div>
      ) : (
        <div className="container">
          <div className="title">
            <h1>Messages</h1>
            <span className="conversation-count">{data.length} conversations</span>
          </div>
          
          {/* Desktop Table View */}
          <div className="desktop-view">
            <table>
              <thead>
                <tr>
                  <th>{currentUser.isSeller ? "Buyer" : "Seller"}</th>
                  <th>Last Message</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr
                    className={
                      ((currentUser.isSeller && !c.readBySeller) ||
                        (!currentUser.isSeller && !c.readByBuyer)) &&
                      "active"
                    }
                    key={c.id}
                  >
                    <td>
                      <div className="user-cell">
                        <img 
                          src={users[currentUser.isSeller ? c.buyerId : c.sellerId]?.img || "/img/noavatar.jpg"} 
                          alt="Profile" 
                          className="user-avatar"
                        />
                        <span className="username">
                          {users[currentUser.isSeller ? c.buyerId : c.sellerId]?.username || 
                           (currentUser.isSeller ? c.buyerId : c.sellerId)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Link to={`/message/${c.id}`} className="link">
                        {c?.lastMessage?.substring(0, 100)}...
                      </Link>
                    </td>
                    <td>{moment(c.updatedAt).fromNow()}</td>
                    <td>
                      {((currentUser.isSeller && !c.readBySeller) ||
                        (!currentUser.isSeller && !c.readByBuyer)) && (
                        <button onClick={() => handleRead(c.id)}>
                          Mark as Read
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-view">
            {data.map((c) => (
              <div
                className={`conversation-card ${
                  ((currentUser.isSeller && !c.readBySeller) ||
                    (!currentUser.isSeller && !c.readByBuyer)) &&
                  "unread"
                }`}
                key={c.id}
              >
                <Link to={`/message/${c.id}`} className="card-link">
                  <div className="card-header">
                    <img 
                      src={users[currentUser.isSeller ? c.buyerId : c.sellerId]?.img || "/img/noavatar.jpg"} 
                      alt="Profile" 
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <h3 className="username">
                        {users[currentUser.isSeller ? c.buyerId : c.sellerId]?.username || 
                         (currentUser.isSeller ? c.buyerId : c.sellerId)}
                      </h3>
                      <span className="timestamp">{moment(c.updatedAt).fromNow()}</span>
                    </div>
                    {((currentUser.isSeller && !c.readBySeller) ||
                      (!currentUser.isSeller && !c.readByBuyer)) && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                  <div className="card-content">
                    <p className="last-message">
                      {c?.lastMessage?.substring(0, 80)}...
                    </p>
                  </div>
                </Link>
                {((currentUser.isSeller && !c.readBySeller) ||
                  (!currentUser.isSeller && !c.readByBuyer)) && (
                  <button 
                    className="mark-read-btn"
                    onClick={() => handleRead(c.id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>

          {data.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No conversations yet</h3>
              <p>Start a conversation by messaging a seller or buyer</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;
