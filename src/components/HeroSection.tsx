import React from "react";
import Button from "./Button";

const HeroSection: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-16 bg-gradient-to-b from-pink-50 to-white">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        Find your perfect match today 💖
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Discover people near you, swipe right to connect, and start chatting instantly.
      </p>
      <Button label="Get Started" variant="primary" />
    </section>
  );
};

export default HeroSection;
