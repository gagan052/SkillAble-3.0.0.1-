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
      const cover = await upload(singleFile);

      const images = await Promise.all(
        [...files].map(async (file) => {
          const url = await upload(file);
          return url;
        })
      );
      setUploading(false);
      dispatch({ type: "ADD_IMAGES", payload: { cover, images } });
      setError(null); // Clear any errors after successful upload
    } catch (err) {
      setUploading(false);
      setError("Error uploading images. Please try again.");
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
        <h1>Add New Gig</h1>
        {error && <div className="error">{error}</div>}
        <div className="sections">
          <div className="info">
            <label htmlFor="">Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. I will do something I'm really good at"
              onChange={handleChange}
            />
            <label htmlFor="">Category</label>
            <select name="cat" id="cat" onChange={handleChange}>
              <option value="">Select a category</option>
              <option value="ai_artists">AI Artists</option>
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
            <div className="images">
              <div className="imagesInputs">
                <label htmlFor="">Cover Image</label>
                <input
                  type="file"
                  onChange={(e) => setSingleFile(e.target.files[0])}
                />
                <label htmlFor="">Upload Images</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                />
              </div>
              <button onClick={handleUpload}>
                {uploading ? "uploading" : "Upload"}
              </button>
            </div>
            <label htmlFor="">Description</label>
            <textarea
              name="desc"
              id=""
              placeholder="Brief descriptions to introduce your service to customers"
              cols="0"
              rows="16"
              onChange={handleChange}
            ></textarea>
            <button onClick={handleSubmit}>Create</button>
          </div>
          <div className="details">
            <label htmlFor="">Service Title</label>
            <input
              type="text"
              name="shortTitle"
              placeholder="e.g. One-page web design"
              onChange={handleChange}
            />
            <label htmlFor="">Short Description</label>
            <textarea
              name="shortDesc"
              onChange={handleChange}
              id=""
              placeholder="Short description of your service"
              cols="30"
              rows="10"
            ></textarea>
            <label htmlFor="">Delivery Time (e.g. 3 days)</label>
            <input type="number" name="deliveryTime" onChange={handleChange} />
            <label htmlFor="">Revision Number</label>
            <input
              type="number"
              name="revisionNumber"
              onChange={handleChange}
            />
            <label htmlFor="">Add Features</label>
            <form action="" className="add" onSubmit={handleFeature}>
              <input type="text" placeholder="e.g. page design" />
              <button type="submit">add</button>
            </form>
            <div className="addedFeatures">
              {state?.features?.map((f) => (
                <div className="item" key={f}>
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_FEATURE", payload: f })
                    }
                  >
                    {f}
                    <span>X</span>
                  </button>
                </div>
              ))}
            </div>
            <label htmlFor="">Price</label>
            <input type="number" onChange={handleChange} name="price" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;
