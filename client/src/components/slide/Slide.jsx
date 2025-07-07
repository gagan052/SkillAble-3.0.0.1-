import React, { useState, useEffect } from "react";
import "./Slide.scss";
import Slider from "infinite-react-carousel";
// import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slide = ({ children, slidesToShow, arrowsScroll }) => {
  const [currentSlidesToShow, setCurrentSlidesToShow] = useState(slidesToShow);
  const [currentArrowsScroll, setCurrentArrowsScroll] = useState(arrowsScroll);

  // Function to update slides based on window width
  const updateSlidesCount = () => {
    const width = window.innerWidth;
    
    if (width <= 480) {
      setCurrentSlidesToShow(Math.min(2, slidesToShow));
      setCurrentArrowsScroll(Math.min(1, arrowsScroll));
    } else if (width <= 768) {
      setCurrentSlidesToShow(Math.min(2, slidesToShow));
      setCurrentArrowsScroll(Math.min(1, arrowsScroll));
    } else if (width <= 1024) {
      setCurrentSlidesToShow(Math.min(3, slidesToShow));
      setCurrentArrowsScroll(Math.min(2, arrowsScroll));
    }else if (width <= 1440) {
      setCurrentSlidesToShow(Math.min(5, slidesToShow));
      setCurrentArrowsScroll(Math.min(2, arrowsScroll));
    } else {
      setCurrentSlidesToShow(slidesToShow);
      setCurrentArrowsScroll(arrowsScroll);
    }
  };

  // Initial setup and window resize listener
  useEffect(() => {
    updateSlidesCount();
    window.addEventListener('resize', updateSlidesCount);
    
    return () => {
      window.removeEventListener('resize', updateSlidesCount);
    };
  }, [slidesToShow, arrowsScroll]);

  return (
    <div className="slide">
      <div className="container">
        <Slider slidesToShow={currentSlidesToShow} arrowsScroll={currentArrowsScroll}>
          {children}
        </Slider>
      </div>
    </div>
  );
};

export default Slide;
