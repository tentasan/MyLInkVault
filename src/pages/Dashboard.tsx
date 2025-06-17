import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Github,
  Linkedin,
  Youtube,
  Instagram,
  ExternalLink,
  Settings,
  Eye,
  Users,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  userAPI,
  connectionsAPI,
  analyticsAPI,
  type Connection,
  type AnalyticsOverview,
} from "../lib/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch user connections
        const connectionsData = await connectionsAPI.getConnections();
        setConnections(connectionsData);

        // Fetch analytics overview
        try {
          const analyticsData = await analyticsAPI.getOverview();
          setAnalytics(analyticsData);
        } catch (analyticsError) {
          console.warn("Analytics data not available:", analyticsError);
          // Don't fail the whole dashboard if analytics fails
        }
      } catch (err: any) {
        console.error("Dashboard data fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return Github;
      case "linkedin":
        return Linkedin;
      case "youtube":
        return Youtube;
      case "instagram":
        return Instagram;
      default:
        return Github;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return "bg-gray-900";
      case "linkedin":
        return "bg-blue-600";
      case "youtube":
        return "bg-red-600";
      case "instagram":
        return "bg-pink-600";
      default:
        return "bg-gray-500";
    }
  };

  const handlePlatformClick = async (connection: Connection) => {
    try {
      const { url } = await connectionsAPI.trackClick(connection.id);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to track click:", error);
      window.open(connection.url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-brand">
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-brand">
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-12">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Error Loading Dashboard
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-brand">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-white/80 text-lg">
            Manage your digital identity from one beautiful dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Profile Views
                  </p>
                  <p className="text-2xl font-bold text-brand-blue">
                    {analytics?.overview.totalViews?.toLocaleString() || "0"}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-brand-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Connected Platforms
                  </p>
                  <p className="text-2xl font-bold text-brand-blue">
                    {connections.filter((c) => c.isActive).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-brand-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Clicks
                  </p>
                  <p className="text-2xl font-bold text-brand-blue">
                    {analytics?.overview.totalClicks?.toLocaleString() || "0"}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-brand-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your Profile
                  <Link to="/settings">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="bg-brand-blue text-white text-xl">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  {user?.title && (
                    <p className="text-brand-blue font-medium">{user.title}</p>
                  )}
                  {user?.company && (
                    <p className="text-sm text-muted-foreground">
                      {user.company}
                    </p>
                  )}
                  {user?.location && (
                    <p className="text-sm text-muted-foreground">
                      {user.location}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {user?.bio && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Bio
                      </p>
                      <p className="text-sm">{user.bio}</p>
                    </div>
                  )}

                  {user?.website && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Website
                      </p>
                      <a
                        href={user.website}
                        className="text-sm text-brand-blue hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full bg-brand-blue hover:bg-brand-purple">
                    <Eye className="h-4 w-4 mr-2" />
                    View Public Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connected Platforms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Connected Platforms */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
                <CardDescription>
                  Your active social media and professional connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connections.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No platforms connected yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Connect your GitHub account through OAuth to get started!
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {connections
                      .filter((connection) => connection.isActive)
                      .map((connection) => {
                        const IconComponent = getPlatformIcon(
                          connection.platform,
                        );
                        const colorClass = getPlatformColor(
                          connection.platform,
                        );
                        return (
                          <div
                            key={connection.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                  <IconComponent className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium capitalize">
                                    {connection.platform}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    @{connection.username}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className="bg-green-100"
                              >
                                Connected
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">
                                {connection.platform === "github" &&
                                  connection.metadata &&
                                  `${connection.metadata.repos} repos • ${connection.metadata.followers} followers`}
                                {connection.platform === "linkedin" &&
                                  connection.metadata &&
                                  `${connection.metadata.connections} connections`}
                                {connection.platform === "youtube" &&
                                  connection.metadata &&
                                  `${connection.metadata.subscribers} subscribers`}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePlatformClick(connection)}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link to="/settings">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex-col space-y-2"
                    >
                      <Settings className="h-6 w-6" />
                      <span>Profile Settings</span>
                    </Button>
                  </Link>
                  <Link to="/analytics">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex-col space-y-2"
                    >
                      <BarChart3 className="h-6 w-6" />
                      <span>View Analytics</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
