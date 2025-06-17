import React from "react";
import Navigation from "../components/Navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-brand">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            About MyLinkVault
          </h1>
          <p className="text-white/80 text-lg">
            Learn more about our mission to unify your digital identity
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Our about page is being crafted. Here's what MyLinkVault is all
              about:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p>
                <strong>Our Mission:</strong> To simplify how developers and
                creators manage their online presence by providing a unified
                platform for all their digital profiles.
              </p>
              <p>
                <strong>The Problem:</strong> Managing multiple social profiles,
                portfolios, and professional accounts is time-consuming and
                fragmented.
              </p>
              <p>
                <strong>Our Solution:</strong> A beautiful, centralized
                dashboard that aggregates your GitHub, LinkedIn, YouTube,
                Instagram, and more into one shareable portfolio.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
