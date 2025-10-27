import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <Navbar />
      <main>
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl bg-pink-50">
                <div className="text-4xl mb-4">👤</div>
                <h3 className="text-xl font-semibold mb-2">Create Profile</h3>
                <p className="text-gray-600">
                  Sign up and tell us about yourself
                </p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-blue-50">
                <div className="text-4xl mb-4">💖</div>
                <h3 className="text-xl font-semibold mb-2">Swipe & Match</h3>
                <p className="text-gray-600">
                  Like someone? Swipe right to connect
                </p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-purple-50">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">Chat</h3>
                <p className="text-gray-600">
                  Start chatting with your matches
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to find your match?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of people finding love today
            </p>
            <button className="bg-white text-pink-500 px-8 py-3 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors">
              Get Started for Free
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
