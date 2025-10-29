import React from "react";
import Button from "./Button"; //
import backgroundImage from '../img/4.jpg'; // Path to your first image
import backgroundImage2 from '../img/5.jpg'; // Path to your second image
import backgroundImage3 from '../img/3.jpg'; // Path to your third image
import { Link } from 'react-router-dom'; // Import Link

const HeroSection: React.FC = () => {
  return (
    // Main section - Relative positioning, adjusted padding, remove gradient
    <section className="relative flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 overflow-hidden min-h-[400px] md:min-h-[500px] bg-gray-100"> {/* Added a fallback bg color */}

      {/* Image container - Absolute, fills the entire section, sits behind text */}
      <div className="absolute inset-0 z-0 flex"> {/* Removed opacity here, apply to overlay instead if needed */}
        {/* Each image wrapper takes up a third of the width */}
        <div className="w-1/3 h-full">
          <img
            src={backgroundImage}
            alt="Background scene 1"
            className="w-full h-full object-cover" // object-cover fills the div
          />
        </div>
        <div className="w-1/3 h-full">
          <img
            src={backgroundImage2}
            alt="Background scene 2"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-1/3 h-full">
          <img
            src={backgroundImage3}
            alt="Background scene 3"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Overlay for text readability - Adjust opacity (e.g., bg-black/30) */}
        <div className="absolute inset-0 bg-black/20"></div> {/* Example: subtle dark overlay */}
      </div>

      {/* Text content - Relative, sits on top */}
      <div className="relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"> {/* Changed text to white, increased drop shadow */}
          Find your perfect match today 💖
        </h2>
        <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-md mx-auto drop-shadow-md"> {/* Changed text to light gray, increased drop shadow */}
          Discover people near you, swipe right to connect, and start chatting instantly.
        </p>
        <Link to="/signup"> {/* Set the destination route */}
          <Button label="Get Started" variant="primary" /> {/* */}
        </Link>
      </div>

    </section>
  );
};

export default HeroSection;