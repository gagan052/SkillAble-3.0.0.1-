import React, { useReducer, useState, useEffect } from "react";
import "./Add.scss";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

const Add = () => {
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();
  
  // Check if user is a seller
  useEffect(() => {
    if (!currentUser || !currentUser.isSeller) {
      setError("Only sellers can create gigs!");
    }
  }, []);

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };
  
  const handleFeature = (e) => {
    e.preventDefault();
    dispatch({
      type: "ADD_FEATURE",
      payload: e.target[0].value,
    });
    e.target[0].value = "";
  };

  const handleUpload = async () => {
    if (!singleFile) {
      setError("Please select a cover image");
      return;
    }
    
    setUploading(true);
    try {
      const coverResult = await upload(singleFile);
      const cover = coverResult.url;

      const mediaItems = await Promise.all(
        [...files].map(async (file) => {
          const result = await upload(file);
          return {
            url: result.url,
            type: result.resourceType // 'image' or 'video'
          };
        })
      );
      setUploading(false);
      dispatch({ type: "ADD_IMAGES", payload: { cover, mediaItems } });
      setError(null); // Clear any errors after successful upload
    } catch (err) {
      setUploading(false);
      setError("Error uploading media files. Please try again.");
      console.log(err);
    }
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (gig) => {
      return newRequest.post("/gigs", gig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      navigate("/mygigs");
    },
    onError: (error) => {
      setError(error.response?.data || "Something went wrong!");
      console.error("Error creating gig:", error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!currentUser?.isSeller) {
      setError("Only sellers can create gigs!");
      return;
    }
    
    // Check each required field individually and provide specific error messages
    if (!state.title) {
      setError("Please enter a title");
      return;
    }
    if (!state.cat) {
      setError("Please select a category");
      return;
    }
    if (!state.desc) {
      setError("Please enter a description");
      return;
    }
    if (!state.shortTitle) {
      setError("Please enter a service title");
      return;
    }
    if (!state.shortDesc) {
      setError("Please enter a short description");
      return;
    }
    if (!state.deliveryTime) {
      setError("Please enter delivery time");
      return;
    }
    if (!state.revisionNumber) {
      setError("Please enter revision number");
      return;
    }
    if (!state.price) {
      setError("Please enter a price");
      return;
    }
    if (!state.cover) {
      setError("Please upload a cover image");
      return;
    }
    
    setError(null);
    mutation.mutate(state);
  }

  return (
    <div className="add">
      <div className="container">
        <header className="add-header">
          <h1>Add New Gig</h1>
          <p className="subtitle">Create a new service to showcase your skills</p>
        </header>
        
        {error && (
          <div className="error-message" role="alert">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="gig-form">
          <div className="sections">
            <div className="info">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="e.g. I will do something I'm really good at"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cat">Category</label>
                <select name="cat" id="cat" onChange={handleChange} required>
                  <option value="">Select a category</option>
                  <option value="ai_artists">AI Artists</option>
                  <option value="web_design">Web Design</option>
                  <option value="logo_design">Logo Design</option>
                  <option value="ai_service">AI Service</option>
                  <option value="wordpress">WordPress</option>
                  <option value="voice_over">Voice Over</option>
                  <option value="video_explainer">Video Explainer</option>
                  <option value="social_media">Social Media</option>
                  <option value="seo">SEO</option>
                  <option value="illustration">Illustration</option>
                  <option value="graphics_design">Graphics & Design</option>
                  <option value="digital_marketing">Digital Marketing</option>
                  <option value="writing_translation">Writing & Translation</option>
                  <option value="video_animation">Video & Animation</option>
                  <option value="music_audio">Music & Audio</option>
                  <option value="programming_tech">Programming & Tech</option>
                  <option value="business">Business</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="data">Data</option>
                  <option value="photography">Photography</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="cover-image">Cover Image</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="cover-image"
                    accept="image/*"
                    onChange={(e) => setSingleFile(e.target.files[0])}
                    className="file-input"
                  />
                  <label htmlFor="cover-image" className="file-label">
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">
                      {singleFile ? singleFile.name : "Choose cover image"}
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="gallery-images">Gallery Images & Videos</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="gallery-images"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    className="file-input"
                  />
                  <label htmlFor="gallery-images" className="file-label">
                    <span className="upload-icon">🖼️</span>
                    <span className="upload-text">
                      {files.length > 0 
                        ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                        : "Choose gallery images & videos"
                      }
                    </span>
                  </label>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={handleUpload}
                className="upload-btn"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Uploading...
                  </>
                ) : (
                  "Upload Media"
                )}
              </button>
              
              {state.mediaItems && state.mediaItems.length > 0 && (
                <div className="media-preview">
                  <h4>Media Preview</h4>
                  <div className="media-grid">
                    {state.mediaItems.map((item, index) => (
                      <div key={index} className="media-item">
                        {item.type === 'video' ? (
                          <video 
                            src={item.url} 
                            controls 
                            className="video-preview"
                          />
                        ) : (
                          <img 
                            src={item.url} 
                            alt={`Gallery item ${index}`} 
                            className="image-preview"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  name="desc"
                  id="description"
                  placeholder="Brief descriptions to introduce your service to customers"
                  rows="8"
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>
            
            <div className="details">
              <div className="form-group">
                <label htmlFor="shortTitle">Service Title</label>
                <input
                  type="text"
                  id="shortTitle"
                  name="shortTitle"
                  placeholder="e.g. One-page web design"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="shortDesc">Short Description</label>
                <textarea
                  name="shortDesc"
                  id="shortDesc"
                  placeholder="Short description of your service"
                  rows="4"
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="deliveryTime">Delivery Time (days)</label>
                  <input 
                    type="number" 
                    id="deliveryTime"
                    name="deliveryTime" 
                    min="1"
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="revisionNumber">Revisions</label>
                  <input
                    type="number"
                    id="revisionNumber"
                    name="revisionNumber"
                    min="0"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="features">Add Features</label>
                <div className="feature-form">
                  <div className="feature-input-wrapper">
                    <input 
                      type="text" 
                      id="features"
                      placeholder="e.g. page design" 
                      className="feature-input"
                    />
                    <button 
                      type="button" 
                      className="add-feature-btn"
                      onClick={() => {
                        const input = document.getElementById('features');
                        if (input.value.trim()) {
                          dispatch({
                            type: "ADD_FEATURE",
                            payload: input.value.trim(),
                          });
                          input.value = "";
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                <div className="addedFeatures">
                  {state?.features?.map((f) => (
                    <div className="feature-tag" key={f}>
                      <span className="feature-text">{f}</span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({ type: "REMOVE_FEATURE", payload: f })
                        }
                        className="remove-feature-btn"
                        aria-label={`Remove ${f}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input 
                  type="number" 
                  id="price"
                  name="price" 
                  min="1"
                  step="0.01"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="create-btn" disabled={mutation.isLoading}>
              {mutation.isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating...
                </>
              ) : (
                "Create Gig"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
