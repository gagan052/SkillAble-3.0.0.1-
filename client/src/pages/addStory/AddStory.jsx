import React, { useState, useRef } from "react";
import "./AddStory.scss";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import upload from "../../utils/upload";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function AddStory() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [expiration, setExpiration] = useState(24); // Default 24 hours
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  // Redirect to login if no user is logged in
  React.useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      setCrop(undefined);
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  // Set initial crop when image loads
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropDefault = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        9 / 16, // Instagram story aspect ratio
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(cropDefault);
    imgRef.current = e.currentTarget;
  };
  
  // Generate cropped image
  const getCroppedImg = async () => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match the desired crop size
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };
  
  // Create story mutation
  const mutation = useMutation({
    mutationFn: async (story) => {
      return newRequest.post("/stories", story);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stories"]);
      navigate("/explore");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Something went wrong");
      setUploading(false);
    },
  });
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!file) {
      setError("Please select an image for your story");
      return;
    }
    
    if (!completedCrop) {
      setError("Please crop your image before uploading");
      return;
    }
    
    try {
      setUploading(true);
      
      // Get the cropped image as a Blob
      const croppedImageBlob = await getCroppedImg();
      if (!croppedImageBlob) {
        setError("Error cropping image. Please try again.");
        setUploading(false);
        return;
      }
      
      // Create a File from the Blob
      const croppedImageFile = new File([croppedImageBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      // Upload cropped image
      const imageUrl = await upload(croppedImageFile);
      
      // Create story with specified expiration
      const story = {
        imageUrl,
        text,
        expiresAt: new Date(Date.now() + expiration * 60 * 60 * 1000).toISOString(),
      };
      
      mutation.mutate(story);
    } catch (err) {
      console.error("Error creating story:", err);
      setError("Failed to upload image. Please try again.");
      setUploading(false);
    }
  };
  
  return (
    <div className="add-story">
      <div className="container">
        <h1>Create a New Story</h1>
        <p className="info">Upload, crop, and share your story</p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="image-upload">
            <input 
              type="file" 
              id="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: "none" }}
            />
            
            {!preview ? (
              <div 
                className="upload-area"
                onClick={() => document.getElementById("file").click()}
              >
                <div className="placeholder">
                  <i className="upload-icon">+</i>
                  <p>Click to upload an image</p>
                </div>
              </div>
            ) : (
              <div className="crop-container">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={9 / 16}
                  className="crop-tool"
                >
                  <img
                    ref={imgRef}
                    src={preview}
                    alt="Preview"
                    onLoad={onImageLoad}
                    className="preview-image"
                  />
                </ReactCrop>
                <div className="crop-instructions">
                  <p>Drag to adjust crop. Default ratio is 9:16 (Instagram story)</p>
                  <button 
                    type="button"
                    className="change-image"
                    onClick={() => document.getElementById("file").click()}
                  >
                    Change Image
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-input">
            <label htmlFor="story-text">Add a caption (optional)</label>
            <textarea
              id="story-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write something..."
              maxLength={200}
            />
            <div className="char-count">{text.length}/200</div>
          </div>
          
          <div className="duration-selection">
            <label htmlFor="expiration">Story Duration</label>
            <select 
              id="expiration" 
              value={expiration} 
              onChange={(e) => setExpiration(Number(e.target.value))}
            >
              <option value={24}>24 hours (default)</option>
              <option value={12}>12 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours</option>
            </select>
          </div>
          
          <div className="buttons">
            <button 
              type="button" 
              className="cancel" 
              onClick={() => navigate(-1)}
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit" 
              disabled={uploading || !file || !completedCrop}
            >
              {uploading ? 
                <div className="loading-spinner"><div className="spinner"></div> Creating...</div> 
                : "Create Story"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStory;