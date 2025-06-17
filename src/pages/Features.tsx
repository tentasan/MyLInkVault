import React from "react";
import Navigation from "../components/Navigation";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Github,
  Linkedin,
  Youtube,
  Instagram,
  BarChart3,
  Shield,
  Zap,
  Users,
  Eye,
  Share2,
  Settings,
  Globe,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const Features = () => {
  const mainFeatures = [
    {
      icon: Users,
      title: "Unified Digital Identity",
      description:
        "Connect all your professional and social profiles in one beautiful, centralized dashboard.",
      features: [
        "GitHub repositories and contributions",
        "LinkedIn professional network",
        "YouTube channel and videos",
        "Instagram creative content",
        "Custom bio and personal branding",
      ],
      color: "bg-blue-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Get detailed insights into how people discover and engage with your digital presence.",
      features: [
        "Real-time profile view tracking",
        "Platform-specific click analytics",
        "Traffic source analysis",
        "Engagement metrics and trends",
        "Growth tracking over time",
      ],
      color: "bg-purple-500",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description:
        "Full control over your privacy with granular settings and enterprise-grade security.",
      features: [
        "Granular privacy controls",
        "Public/private profile toggle",
        "Email and location visibility settings",
        "JWT-based authentication",
        "Secure OAuth integrations",
      ],
      color: "bg-green-500",
    },
  ];

  const platformFeatures = [
    {
      icon: Github,
      name: "GitHub",
      description:
        "Showcase your repositories, contributions, and coding activity",
      features: [
        "Repository highlights",
        "Contribution graphs",
        "Follower metrics",
      ],
      color: "bg-gray-900",
      comingSoon: false,
    },
    {
      icon: Linkedin,
      name: "LinkedIn",
      description: "Display your professional network and career achievements",
      features: [
        "Professional connections",
        "Work experience",
        "Skills endorsements",
      ],
      color: "bg-blue-600",
      comingSoon: true,
    },
    {
      icon: Youtube,
      name: "YouTube",
      description: "Feature your video content and channel statistics",
      features: ["Channel metrics", "Popular videos", "Subscriber count"],
      color: "bg-red-600",
      comingSoon: true,
    },
    {
      icon: Instagram,
      name: "Instagram",
      description: "Highlight your visual content and creative work",
      features: ["Recent posts", "Story highlights", "Engagement rates"],
      color: "bg-pink-600",
      comingSoon: true,
    },
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built with modern tech stack for optimal performance",
    },
    {
      icon: Globe,
      title: "Public Portfolios",
      description: "Share your unified profile with a beautiful public URL",
    },
    {
      icon: Settings,
      title: "Easy Management",
      description: "Intuitive dashboard to manage all your connections",
    },
    {
      icon: Share2,
      title: "Social Sharing",
      description: "Built-in sharing tools for all major platforms",
    },
    {
      icon: Eye,
      title: "Real-time Tracking",
      description: "See who's viewing your profile in real-time",
    },
    {
      icon: Star,
      title: "Professional Branding",
      description: "Create a consistent brand across all platforms",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-brand">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-brand-cream" />
            <span className="text-white text-sm font-medium">
              Everything you need to unify your digital presence
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Powerful Features for
            <span className="block text-brand-cream">Modern Creators</span>
          </h1>
          <p className="text-white/80 text-xl max-w-3xl mx-auto leading-relaxed">
            MyLinkVault provides all the tools you need to manage, track, and
            grow your digital identity across multiple platforms.
          </p>
        </div>

        {/* Main Features Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 group"
            >
              <CardHeader className="pb-4">
                <div
                  className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Integration Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Platform Integrations
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Connect your favorite platforms and showcase your work in one
              unified profile
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((platform, index) => (
              <Card
                key={index}
                className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
              >
                {platform.comingSoon && (
                  <Badge className="absolute top-4 right-4 bg-brand-purple text-white">
                    Coming Soon
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <platform.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {platform.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {platform.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {platform.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-blue rounded-full flex-shrink-0"></div>
                        <span className="text-xs text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Modern Workflows
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Every feature designed to enhance your digital presence and
              streamline your workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-blue rounded-lg p-3 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-20">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">4+</div>
              <div className="text-white/80">Platform Integrations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">∞</div>
              <div className="text-white/80">Profile Views Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-white/80">Privacy Control</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80">Real-time Analytics</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Unify Your Digital Identity?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of creators who have simplified their digital
            presence with MyLinkVault
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-brand-blue hover:bg-brand-purple text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-full"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Features;
