import React, { useState, useEffect, useRef } from "react";
import "./Stories.scss";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { Link } from "react-router-dom";

const Stories = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [activeStory, setActiveStory] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const progressRef = useRef(null);
  const timeoutRef = useRef(null);
  const storiesScrollRef = useRef(null);
  
  // Fetch stories from all users
  const { isLoading, error, data: stories } = useQuery({
    queryKey: ["stories"],
    queryFn: () => newRequest.get("/stories").then((res) => res.data),
    // Stories should refresh frequently
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  // Group stories by user
  const userStories = stories?.reduce((acc, story) => {
    // If this user already has stories in the accumulator, add this story
    if (acc[story.userId]) {
      acc[story.userId].stories.push(story);
    } else {
      // Otherwise create a new entry for this user
      acc[story.userId] = {
        userId: story.userId,
        username: story.username,
        userImg: story.userImg,
        stories: [story],
      };
    }
    return acc;
  }, {});

  // Convert the object to an array for rendering
  const storyUsers = userStories ? Object.values(userStories) : [];
  
  // Handle horizontal scroll with buttons
  const scrollStories = (direction) => {
    if (storiesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      storiesScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  // Handle opening a user's stories
  const openStories = (user, event) => {
    event?.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setActiveStory(user);
    setStoryIndex(0);
    setIsPaused(false);
    
    // Mark story as viewed in the backend
    if (currentUser && user.userId !== currentUser._id) {
      const storyId = user.stories[0]._id;
      newRequest.post(`/stories/${storyId}/view`)
        .catch(err => console.error("Error marking story as viewed:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  // Close story viewer
  const closeStories = () => {
    setActiveStory(null);
    setStoryIndex(0);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset the animation
    if (progressRef.current) {
      progressRef.current.style.animation = 'none';
    }
  };
  
  // Navigate to next story
  const nextStory = () => {
    if (!activeStory) return;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Mark current story as viewed
    if (currentUser && activeStory.userId !== currentUser._id) {
      const storyId = activeStory.stories[storyIndex]._id;
      newRequest.post(`/stories/${storyId}/view`)
        .catch(err => console.error("Error marking story as viewed:", err));
    }
    
    // Check if there are more stories from current user
    if (storyIndex < activeStory.stories.length - 1) {
      // Move to next story from same user
      setStoryIndex(storyIndex + 1);
    } else {
      // Find the next user with stories
      const currentUserIndex = storyUsers.findIndex(u => u.userId === activeStory.userId);
      if (currentUserIndex < storyUsers.length - 1) {
        // Move to first story of next user
        setActiveStory(storyUsers[currentUserIndex + 1]);
        setStoryIndex(0);
      } else {
        // End of all stories
        closeStories();
      }
    }
  };

  // Navigate to previous story
  const prevStory = () => {
    if (!activeStory) return;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Check if there are previous stories from current user
    if (storyIndex > 0) {
      // Move to previous story from same user
      setStoryIndex(storyIndex - 1);
    } else {
      // Find the previous user with stories
      const currentUserIndex = storyUsers.findIndex(u => u.userId === activeStory.userId);
      if (currentUserIndex > 0) {
        // Move to last story of previous user
        const prevUser = storyUsers[currentUserIndex - 1];
        setActiveStory(prevUser);
        setStoryIndex(prevUser.stories.length - 1);
      }
    }
  };

  // Handle pausing/resuming story
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    
    const progressBar = document.querySelector('.progress-bar.active .progress-fill');
    if (progressBar) {
      if (!isPaused) {
        // Pause the animation
        const computedStyle = window.getComputedStyle(progressBar);
        const width = computedStyle.getPropertyValue('width');
        const animationDuration = computedStyle.getPropertyValue('animation-duration');
        
        progressBar.style.animationPlayState = 'paused';
        progressBar.style.width = width;
        
        // Clear the timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        // Resume the animation
        progressBar.style.animationPlayState = 'running';
        
        // Restart the timeout (approximating remaining time)
        const computedStyle = window.getComputedStyle(progressBar);
        const width = parseFloat(computedStyle.getPropertyValue('width'));
        const totalWidth = parseFloat(window.getComputedStyle(progressBar.parentElement).getPropertyValue('width'));
        const percentComplete = width / totalWidth;
        const remainingTime = (1 - percentComplete) * 5000; // 5 seconds total
        
        timeoutRef.current = setTimeout(nextStory, remainingTime);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeStory) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevStory();
          break;
        case 'ArrowRight':
          nextStory();
          break;
        case 'Escape':
          closeStories();
          break;
        case ' ': // Space bar
          handlePauseResume();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStory, storyIndex, isPaused]);
  
  // Auto-advance stories after a delay
  useEffect(() => {
    if (activeStory && !isPaused) {
      // Reset any existing animation
      const progressBar = document.querySelector('.progress-bar.active .progress-fill');
      if (progressBar) {
        progressBar.style.animation = 'none';
        // Trigger reflow
        void progressBar.offsetWidth;
        progressBar.style.animation = 'progress 5s linear forwards';
        progressBar.style.animationPlayState = 'running';
      }
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(nextStory, 5000); // 5 seconds per story
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [activeStory, storyIndex, isPaused]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.classList.contains('story-viewer-container')) {
        closeStories();
      }
    };
    
    if (activeStory) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeStory]);

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Current story being viewed
  const currentStory = activeStory?.stories[storyIndex];

  // Check if we need to show scroll buttons - only show when there are enough stories
  const showScrollButtons = storyUsers.length > 0 && storyUsers.length + (currentUser ? 1 : 0) > 4;

  return (
    <div className="stories-container">
      {isLoading ? (
        <div className="loading">Loading stories...</div>
      ) : error ? (
        <div className="error">Error loading stories</div>
      ) : storyUsers.length > 0 ? (
        <div className="stories-wrapper">
          {/* {showScrollButtons && (
            <button 
              className="scroll-button left"
              onClick={() => scrollStories('left')}
              aria-label="Scroll left"
            >
              ‹
            </button>
          )} */}
          
          <div 
            className="stories-scroll"
            ref={storiesScrollRef}
          >
            {currentUser && (
              <div className="story-item add-story">
                <Link to="/add-story" className="add-story-link">
                  <div className="story-avatar">
                    <img src={currentUser.img || "/img/noavatar.jpg"} alt="Your profile" />
                    <div className="add-icon">+</div>
                  </div>
                  <span>Add Story</span>
                </Link>
              </div>
            )}
            
            {storyUsers.map((user) => {
              // Check if current user has viewed all stories from this user
              const allViewed = currentUser && user.stories.every(story => 
                story.views?.includes(currentUser._id)
              );
              
              return (
                <div 
                  key={user.userId} 
                  className="story-item"
                  onClick={(e) => openStories(user, e)}
                >
                  <div className={`story-avatar ${allViewed ? 'viewed' : 'new'}`}>
                    <img src={user.userImg || "/img/noavatar.jpg"} alt={user.username} />
                  </div>
                  <span>{user.username}</span>
                </div>
              );
            })}
          </div>
          
          {/* {showScrollButtons && (
            <button 
              className="scroll-button right"
              onClick={() => scrollStories('right')}
              aria-label="Scroll right"
            >
              ›
            </button>
          )} */}
          
          {/* Story Viewer */}
          {activeStory && currentStory && (
            <div className="story-viewer-container">
              <div className="story-viewer">
                <div className="story-header">
                  <div className="user-info">
                    <img 
                      src={activeStory.userImg || "/img/noavatar.jpg"} 
                      alt={activeStory.username} 
                    />
                    <span>{activeStory.username}</span>
                    <span className="timestamp">
                      {new Date(currentStory.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="close-btn" onClick={closeStories}>×</div>
                </div>
                
                <div className="story-progress">
                  {activeStory.stories.map((story, index) => (
                    <div 
                      key={story._id} 
                      className={`progress-bar ${
                        index < storyIndex ? 'viewed' : 
                        index === storyIndex ? 'active' : ''
                      }`}
                      onClick={() => {
                        if (index !== storyIndex) {
                          setStoryIndex(index);
                        }
                      }}
                    >
                      <div 
                        className="progress-fill"
                        ref={index === storyIndex ? progressRef : null}
                      ></div>
                    </div>
                  ))}
                </div>
                
                <div 
                  className="story-content"
                  onClick={handlePauseResume}
                >
                  <div className="story-image">
                    <img 
                      src={currentStory.imageUrl} 
                      alt="Story" 
                    />
                  </div>
                  
                  {currentStory.text && (
                    <div className="story-text">
                      {currentStory.text}
                    </div>
                  )}
                  
                  {loading && (
                    <div className="story-loading">
                      <div className="spinner"></div>
                    </div>
                  )}
                  
                  <div className="story-nav">
                    <div className="nav-left" onClick={(e) => {
                      e.stopPropagation();
                      prevStory();
                    }}></div>
                    <div className="nav-right" onClick={(e) => {
                      e.stopPropagation();
                      nextStory();
                    }}></div>
                  </div>
                </div>
                
                {currentUser && currentUser._id === activeStory.userId && (
                  <div className="story-actions">
                    <Link 
                      to="/add-story" 
                      className="add-new-story-btn"
                      onClick={closeStories}
                    >
                      Add New Story
                    </Link>
                    <button 
                      className="delete-story-btn"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this story?")) {
                          newRequest.delete(`/stories/${currentStory._id}`)
                            .then(() => {
                              // If it was the only story, close the viewer
                              if (activeStory.stories.length === 1) {
                                closeStories();
                              } 
                              // If it was the last story, go to previous
                              else if (storyIndex === activeStory.stories.length - 1) {
                                setStoryIndex(storyIndex - 1);
                              } 
                              // Otherwise refresh the stories
                              else {
                                // This will cause a re-render with the story removed
                                setActiveStory({
                                  ...activeStory,
                                  stories: activeStory.stories.filter(s => s._id !== currentStory._id)
                                });
                              }
                            })
                            .catch(err => {
                              console.error("Error deleting story:", err);
                              alert("Failed to delete story. Please try again.");
                            });
                        }
                      }}
                    >
                      Delete Story
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-stories">
          <p>No stories yet</p>
          {currentUser && (
            <Link to="/add-story" className="add-story-btn">
              Create Your First Story
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Stories;