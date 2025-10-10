import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./CollaborationForm.scss";

const CollaborationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillsRequired: [],
    positions: [{ role: "", count: 1, filled: 0 }],
    mode: "Unpaid",
    deadline: ""
  });
  
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (collaboration) => {
      return newRequest.post("/collaborations", collaboration);
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSkillAdd = () => {
    if (skillInput.trim() && !formData.skillsRequired.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skillInput.trim()]
      }));
      setSkillInput("");
      
      // Clear error when skills are added
      if (errors.skillsRequired) {
        setErrors((prev) => ({ ...prev, skillsRequired: null }));
      }
    }
  };

  const handleSkillRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((_, i) => i !== index)
    }));
  };

  const handlePositionChange = (index, field, value) => {
    const updatedPositions = [...formData.positions];
    updatedPositions[index][field] = field === "count" ? parseInt(value) || 1 : value;
    
    setFormData((prev) => ({
      ...prev,
      positions: updatedPositions
    }));
    
    // Clear error when positions are updated
    if (errors.positions) {
      setErrors((prev) => ({ ...prev, positions: null }));
    }
  };

  const addPosition = () => {
    setFormData((prev) => ({
      ...prev,
      positions: [...prev.positions, { role: "", count: 1, filled: 0 }]
    }));
  };

  const removePosition = (index) => {
    if (formData.positions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        positions: prev.positions.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (formData.skillsRequired.length === 0) {
      newErrors.skillsRequired = "At least one skill is required";
    }
    
    const invalidPositions = formData.positions.some(pos => !pos.role.trim());
    if (invalidPositions) {
      newErrors.positions = "All position roles must be filled";
    }
    
    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        newErrors.deadline = "Deadline must be in the future";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      mutation.mutate(formData);
    }
  };

  return (
    <form className="collaboration-form" onSubmit={handleSubmit}>
      <h2>Create a New Collaboration</h2>
      
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter a descriptive title"
        />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the collaboration project"
          rows={4}
        />
        {errors.description && <span className="error">{errors.description}</span>}
      </div>
      
      <div className="form-group">
        <label>Skills Required</label>
        <div className="skill-input">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add a required skill"
          />
          <button type="button" onClick={handleSkillAdd}>Add</button>
        </div>
        {errors.skillsRequired && <span className="error">{errors.skillsRequired}</span>}
        
        {formData.skillsRequired.length > 0 && (
          <div className="skill-tags">
            {formData.skillsRequired.map((skill, index) => (
              <div key={index} className="skill-tag">
                {skill}
                <button type="button" onClick={() => handleSkillRemove(index)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="form-group">
        <label>Positions</label>
        {errors.positions && <span className="error">{errors.positions}</span>}
        
        {formData.positions.map((position, index) => (
          <div key={index} className="position-item">
            <input
              type="text"
              value={position.role}
              onChange={(e) => handlePositionChange(index, "role", e.target.value)}
              placeholder="Position title"
            />
            <div className="count-input">
              <label>Count:</label>
              <input
                type="number"
                min="1"
                value={position.count}
                onChange={(e) => handlePositionChange(index, "count", e.target.value)}
              />
            </div>
            <button 
              type="button" 
              className="remove-btn"
              onClick={() => removePosition(index)}
              disabled={formData.positions.length <= 1}
            >
              ×
            </button>
          </div>
        ))}
        
        <button type="button" className="add-position-btn" onClick={addPosition}>
          + Add Another Position
        </button>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Mode</label>
          <select name="mode" value={formData.mode} onChange={handleChange}>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Deadline</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.deadline && <span className="error">{errors.deadline}</span>}
        </div>
      </div>
      
      <button 
        type="submit" 
        className="submit-btn"
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? "Creating..." : "Create Collaboration"}
      </button>
      
      {mutation.isError && (
        <div className="error-message">
          {mutation.error.response?.data?.message || "Something went wrong!"}
        </div>
      )}
    </form>
  );
};

export default CollaborationForm;