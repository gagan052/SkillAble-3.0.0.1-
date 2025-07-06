import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Message.scss";

const Message = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [users, setUsers] = useState({});
  const [otherUser, setOtherUser] = useState(null);

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
    const messageText = e.target[0].value.trim();
    if (!messageText) return;
    
    mutation.mutate({
      conversationId: id,
      desc: messageText,
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
          const otherUserData = {
            ...res.data,
            img: res.data.img || "https://images.pexels.com/photos/1115697/pexels-photo-1115697.jpeg?auto=compress&cs=tinysrgb&w=1600"
          };
          userMap[otherUserId] = otherUserData;
          setOtherUser(otherUserData);
        } catch (err) {
          console.error("Error fetching user:", err);
          const fallbackUser = { 
            username: "Unknown User",
            img: "https://images.pexels.com/photos/1115697/pexels-photo-1115697.jpeg?auto=compress&cs=tinysrgb&w=1600"
          };
          userMap[otherUserId] = fallbackUser;
          setOtherUser(fallbackUser);
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
        {/* Chat Header */}
        {otherUser && (
          <div className="chat-header">
            <Link to="/messages" className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <img 
              src={otherUser.img} 
              alt={otherUser.username} 
              className="avatar"
            />
            <div className="user-info">
              <div className="name">{otherUser.username}</div>
              <div className="status online">Online</div>
            </div>
            <div className="header-icons">
              <button className="icon" title="Voice Call">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9844 21.5573 21.2136 21.3521 21.4019C21.1469 21.5902 20.9046 21.7335 20.6407 21.8227C20.3768 21.9119 20.0973 21.9452 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3146 6.72533 15.2661 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09477 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85679 2.63476 2.65208C2.82196 2.44737 3.04988 2.28414 3.30379 2.17249C3.5577 2.06084 3.83231 2.00336 4.10999 2.003H7.10999C7.59522 1.99522 8.06574 2.16708 8.43376 2.48353C8.80178 2.79999 9.042 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97348 7.27675 9.89382 7.65353C9.81416 8.03031 9.62984 8.36871 9.36999 8.62L8.08999 9.9C9.51355 12.3625 11.6375 14.4865 14.1 15.91L15.38 14.63C15.6313 14.3702 15.9697 14.1858 16.3465 14.1062C16.7233 14.0265 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 21.9999 16.92H22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="icon" title="Video Call">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button className="icon" title="More Options">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="1" fill="currentColor"/>
                  <circle cx="19" cy="12" r="1" fill="currentColor"/>
                  <circle cx="5" cy="12" r="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="breadcrumbs">
          <Link to="/messages">Messages</Link>
          <span className="separator">•</span>
          <span className="current-chat">
            {isLoading ? "Loading..." : error ? "Error" : otherUser?.username || "Chat"}
          </span>
        </div>
        
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
            {data.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-icon">💬</div>
                <h3>No messages yet</h3>
                <p>Start the conversation by sending a message</p>
              </div>
            ) : (
              data.map((m) => (
                <div className={m.userId === currentUser._id ? "owner item" : "item"} key={m._id}>
                  <img 
                    src={m.userId === currentUser._id ? currentUser.img || "/img/noavatar.jpg" : otherUser?.img || "/img/noavatar.jpg"} 
                    alt="Profile" 
                  />
                  <div className="message-content">
                    <p>{m.desc}</p>
                    <span className="message-time">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        <form className="write" onSubmit={handleSubmit}>
          <div className="message-input-container">
            <textarea 
              type="text" 
              placeholder="Type a message..." 
              maxLength={1000}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.target.form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }}
            />
            <button 
              type="submit" 
              disabled={mutation.isLoading}
              className={mutation.isLoading ? "loading" : ""}
            >
              {mutation.isLoading ? (
                <div className="send-spinner"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Message;
