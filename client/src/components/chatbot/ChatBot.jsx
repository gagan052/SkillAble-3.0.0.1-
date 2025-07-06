import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import newRequest from '../../utils/newRequest';
import './ChatBot.scss';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { pathname } = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Check if we're on the home page
  const isHomePage = pathname === '/';

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close chat when navigating away from home page
  useEffect(() => {
    if (!isHomePage && isOpen) {
      setIsOpen(false);
    }
  }, [isHomePage, isOpen]);

  // Initialize conversation with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Hello! I'm SkillAble Assistant, your AI-powered helper. I can help you with:\n\n• Finding the perfect gigs for your needs\n• Understanding how SkillAble works\n• Tips for buyers and sellers\n• General questions about our platform\n\nHow can I assist you today?`,
        timestamp: new Date().toISOString(),
        animate: true
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      animate: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await newRequest.post('/chat', {
        message: userMessage.content,
        conversationId: conversationId,
        userId: currentUser?._id || 'anonymous'
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        timestamp: new Date().toISOString(),
        animate: true
      };

      setMessages(prev => [...prev, botMessage]);
      if (!conversationId && response.data.conversationId) {
        setConversationId(response.data.conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again in a moment.',
        timestamp: new Date().toISOString(),
        animate: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Don't render chatbot if not on home page
  if (!isHomePage) {
    return null;
  }

  return (
    <div className="chatbot-container">
      {/* Floating Chat Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
        aria-label="Open chat assistant"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleChat()}
      >
        <FaComments />
        <span className="chatbot-toggle-text">Need help?</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window" role="dialog" aria-modal="true" aria-label="SkillAble Chat Assistant">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              {/* Logo or Bot Avatar */}
              { /* Try to load logo, fallback to FaRobot */ }
              <img src="/img/logo.png" alt="SkillAble Logo" className="chatbot-logo" onError={e => { e.target.style.display = 'none'; }} style={{width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', objectFit: 'cover', marginRight: 8}} />
              <FaRobot className="chatbot-avatar fallback-avatar" style={{display: 'none'}} />
              <div className="chatbot-info">
                <h3>SkillAble Assistant</h3>
                <span className="chatbot-status">AI-powered helper</span>
                <div className="chatbot-subtitle">Ask me anything about SkillAble!</div>
              </div>
            </div>
            <button 
              className="chatbot-close"
              onClick={toggleChat}
              aria-label="Close chat"
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleChat()}
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.type} ${message.animate ? 'pop-in' : ''}`}
                tabIndex={0}
                aria-label={message.type === 'bot' ? 'Assistant message' : 'Your message'}
              >
                <div className="message-avatar">
                  {message.type === 'bot' ? <FaRobot /> : <FaUser />}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    {message.content.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {/* Loading indicator */}
            {isLoading && (
              <div className="message bot pop-in">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <div className="message-bubble loading">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                disabled={isLoading}
                className="message-input"
                aria-label="Type your message"
                tabIndex={0}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="send-button"
                aria-label="Send message"
                tabIndex={0}
              >
                <FaPaperPlane />
              </button>
            </div>
            <div className="input-footer">
              <small>Press Enter to send, Shift+Enter for new line</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot; 