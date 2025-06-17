import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "../components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-brand">
      <Navigation />

      {/* Hero Section */}
      <main className="flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
            <span className="block text-brand-cream">
              Your Digital Identity,
            </span>
          <span className="block text-[#5ab4d4]">Unified</span> 
          </h1>

          {/* Subheading */}
          <p className="text-white/90 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed">
            Stop managing multiple profiles. LinkVault aggregates your GitHub,
            blog posts, social media, and more into one beautiful, shareable
            developer portfolio.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-brand-blue hover:bg-brand-purple text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Get Started Free
              </Button>
            </Link>
            <div className="text-white/60 text-sm">
              No credit card required • Free forever
            </div>
          </div>

          {/* Feature Preview */}
          <div className="mt-16 text-center">
            <p className="text-white/60 text-sm mb-4">
              ✨ Connect platforms like GitHub, LinkedIn, YouTube & Instagram
            </p>
            <div className="inline-flex items-center gap-2 text-white/80 text-sm">
              <span>🔗 Manage all connections in one place</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
