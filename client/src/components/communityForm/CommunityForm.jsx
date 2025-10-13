import React, { useState } from "react";
import "./CommunityForm.scss";
import { useMutation } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const CommunityForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    tags: "",
  });

  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: (community) => {
      return newRequest.post("/communities", community);
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err) => {
      setError(err.response?.data || "Something went wrong!");
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !formData.description.trim()) {
      setError("Name and description are required!");
      return;
    }
    
    // Process tags
    const tagsArray = formData.tags
      ? formData.tags.split(",").map((tag) => tag.trim())
      : [];
    
    // Submit form
    mutation.mutate({
      ...formData,
      tags: tagsArray,
    });
  };

  return (
    <div className="community-form">
      <h2>Create a New Community</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Community Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter community name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your community"
            rows="4"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. design, development, marketing"
          />
        </div>
        
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
          />
          <label htmlFor="isPublic">Public Community (anyone can join)</label>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Creating..." : "Create Community"}
        </button>
      </form>
    </div>
  );
};

export default CommunityForm;