import React from "react";
import Navbar from "../components/Navbar"; //
import HeroSection from "../components/HeroSection"; //
import { Link } from 'react-router-dom'; // Import Link

// Import the five images for the "How It Works" background
import image6 from '../img/6.jpg';
import image7 from '../img/7.jpg';
import image8 from '../img/8.jpg';
import image9 from '../img/9.jpg';
import image10 from '../img/10.jpg';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar /> {/* */}
      <main>
        <HeroSection /> {/* */}

        {/* Features Section ("How It Works") */}
        <section className="relative py-16 px-6 overflow-hidden bg-white">

          {/* Background Image Container - Reduced opacity slightly */}
          <div className="absolute inset-0 z-0 flex opacity-80 md:opacity-90"> {/* Increased opacity */}
            {[image10, image7, image6, image9, image8].map((image, index) => (
              <div key={index} className="w-1/5 h-full">
                <img
                  src={image}
                  alt={`How it works background ${index + 6}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {/* Overlay Removed/Commented Out */}
            {/* <div className="absolute inset-0 bg-white/60"></div> */}
            {/* <div className="absolute inset-0 bg-black/10"></div> */}
          </div>

          {/* Original Content */}
          <div className="relative z-10 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white-500 drop-shadow-sm"> {/* Added subtle drop shadow for readability */}
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature Cards - Kept solid background, maybe add subtle shadow */}
              <div className="text-center p-6 rounded-2xl bg-pink-50 border border-pink-100/50 shadow-sm"> {/* Added shadow-sm */}
                <div className="text-4xl mb-4">👤</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Create Profile</h3>
                <p className="text-gray-700">
                  Sign up and tell us about yourself
                </p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-blue-50 border border-blue-100/50 shadow-sm"> {/* Added shadow-sm */}
                <div className="text-4xl mb-4">💖</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Swipe & Match</h3>
                <p className="text-gray-700">
                  Like someone? Swipe right to connect
                </p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-purple-50 border border-purple-100/50 shadow-sm"> {/* Added shadow-sm */}
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Chat</h3>
                <p className="text-gray-700">
                  Start chatting with your matches
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white bg-opacity-90"> {/* */}
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4"> {/* */}
              Ready to find your match?
            </h2>
            <p className="text-xl mb-8 opacity-90"> {/* */}
              Join thousands of people finding love today
            </p>
            {/* --- Replaced button with Link --- */}
            <Link
              to="/signup" // Set the destination route
              className="inline-block bg-white text-pink-500 px-8 py-3 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors" // Copied styles from button
            >
              Get Started for Free
            </Link>
            {/* --- End replacement --- */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;