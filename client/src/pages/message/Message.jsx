import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Message.scss";

const Message = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [users, setUsers] = useState({});

  const queryClient = useQueryClient();

  // Fetch messages for the conversation
  const { isLoading, error, data } = useQuery({
    queryKey: ["messages", id],
    queryFn: () =>
      newRequest.get(`/messages/${id}`).then((res) => {
        return res.data;
      }),
  });

  // Fetch conversation details to get user IDs
  const { data: conversationData } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () =>
      newRequest.get(`/conversations/${id}`).then((res) => {
        return res.data;
      }),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (message) => {
      return newRequest.post(`/messages`, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      conversationId: id,
      desc: e.target[0].value,
    });
    e.target[0].value = "";
  };

  // Reference for auto-scrolling to the latest message
  const messagesEndRef = useRef(null);

  // Fetch user data for conversation participants
  useEffect(() => {
    const fetchUsers = async () => {
      if (conversationData) {
        const userMap = {};
        
        // Always add current user
        userMap[currentUser._id] = {
          ...currentUser,
          img: currentUser.img || "https://images.pexels.com/photos/1115697/pexels-photo-1115697.jpeg?auto=compress&cs=tinysrgb&w=1600"
        };
        
        // Get the other user in conversation
        const otherUserId = currentUser.isSeller ? conversationData.buyerId : conversationData.sellerId;
        
        try {
          const res = await newRequest.get(`/users/${otherUserId}`);
          userMap[otherUserId] = {
            ...res.data,
            img: res.data.img || "https://images.pexels.com/photos/1115697/pexels-photo-1115697.jpeg?auto=compress&cs=tinysrgb&w=1600"
          };
        } catch (err) {
          console.error("Error fetching user:", err);
          userMap[otherUserId] = { 
            username: "Unknown User",
            img: "https://images.pexels.com/photos/1115697/pexels-photo-1115697.jpeg?auto=compress&cs=tinysrgb&w=1600"
          };
        }
        
        setUsers(userMap);
      }
    };
    
    fetchUsers();
  }, [conversationData, currentUser]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  return (
    <div className="message">
      <div className="container">
        <span className="breadcrumbs">
          <Link to="/messages">Messages</Link> - {isLoading ? "Loading..." : error ? "Error" : "Chat"}
        </span>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>Error loading messages. Please try again later.</p>
          </div>
        ) : (
          <div className="messages">
            {data.map((m) => (
              <div className={m.userId === currentUser._id ? "owner item" : "item"} key={m._id}>
                {/* <img
                  src={users[m.userId]?.img || "https://images.pexels.com/photos/1115697/pexels-photo-1115697.jpeg?auto=compress&cs=tinysrgb&w=1600"}
                  alt={users[m.userId]?.username || "User"}
                /> */}
                <img src={currentUser.img || "/img/noavatar.jpg"} alt="Profile" />
                <p>{m.desc}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        <hr />
        <form className="write" onSubmit={handleSubmit}>
          <textarea type="text" placeholder="write a message" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Message;
