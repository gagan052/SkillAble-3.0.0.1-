import React, { useState, useEffect } from "react";
import "./Featured.scss";
import { useNavigate } from "react-router-dom";

function Featured() {
  const [input, setInput] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const navigate = useNavigate();
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  // Complete list of all available options
  const allOptions = [
    "AI Artists",
    "Logo Design",
    "WordPress",
    "Voice Over",
    "Video Explainer",
    "Social Media",
    "SEO",
    "Illustration",
    "Graphics & Design",
    "Digital Marketing",
    "Writing & Translation",
    "Video & Animation",
    "Music & Audio",
    "Programming & Tech",
    "Business",
    "Lifestyle",
    "Data",
    "Photography",
    "Web Design",
    "Web & Mobile Design",
    "Packaging Design",
    "Book Design",
    "AI Services"
  ];
  
  // Initial options to show (limited to 7)
  const initialOptions = [
    "AI Artists",
    "Logo Design",
    "WordPress",
    "Web Design",
    "Digital Marketing",
    "Programming & Tech",
    
  ];

  const handleSubmit = () => {
    // if (!input.trim()) {
    //   // Don't search if input is empty
    //   return;
    // }
    
    // Check if the input matches any of the categories
    const matchedCategory = allOptions.find(
      option => option.toLowerCase() === input.toLowerCase()
    );
    
    if (matchedCategory) {
      // If it's a category, convert to the format used in the backend (lowercase with underscores)
      const categoryParam = matchedCategory.toLowerCase().replace(/\s+&?\s*/g, '_');
      navigate(`/gigs?cat=${categoryParam}`);
    } else {
      // If not a category, use as general search term
      const searchTerm = encodeURIComponent(input.trim());
      navigate(`/gigs?search=${searchTerm}`);
    }
    
    console.log("Search submitted:", input);
  };
  
  // Filter options based on user input
  const handleInputChange = (e) => {
    const userInput = e.target.value;
    setInput(userInput);
    
    if (userInput.trim() === "") {
      // Show initial options when input is empty
      setFilteredOptions(initialOptions);
    } else {
      // Filter options based on user input
      const filtered = allOptions.filter(option =>
        option.toLowerCase().includes(userInput.toLowerCase())
      );
      setFilteredOptions(filtered.length > 0 ? filtered : []);
    }
  };
  
  // Handle input selection from datalist
  const handleInputSelect = (e) => {
    // Update input state with the selected value
    setInput(e.target.value);
  };
  
  // Set initial options on component mount
  useEffect(() => {
    setFilteredOptions(initialOptions);
  }, []);
  return (
    <div className="featured">
      <div className="container">
        <div className="left">
          <h1>
            Find the perfect <span>freelance</span> services for your business
          </h1>
          {currentUser ? (
            <>
              <div className="search">
                <div className="searchInput">
                  <img src="./img/search-line.png" alt="" />
                  <input
                    type="search"
                    list="browsers"
                    placeholder='What service are you looking for today?'
                    onChange={handleInputChange}
                    onInput={handleInputSelect}
                    value={input}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  <datalist id="browsers">
                    {filteredOptions.map((option, index) => (
                      <option key={index} value={option}></option>
                    ))}
                  </datalist>
                </div>
                <button onClick={handleSubmit}>Search</button>
              </div>
              <div className="popular">
                <span>Popular:</span>
                <button>Web Design</button>
                <button>WordPress</button>
                <button>Logo Design</button>
                <button>AI Services</button>
              </div>
            </>
          ) : (
            <div className="cta-section">
              <p className="cta-text">
                Join thousands of freelancers and clients on SkillAble
              </p>
              <div className="cta-buttons">
                <button 
                  className="cta-button primary" 
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </button>
                <button 
                  className="cta-button secondary" 
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="right">
          <img src="./img/intern.jpg" alt="" />
        </div>
      </div>
    </div>
  );
}

export default Featured;
