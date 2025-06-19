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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Github,
  Linkedin,
  Youtube,
  Instagram,
  Zap,
  ExternalLink,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Code,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { connectionsAPI, type Connection } from "../lib/api";
import { toast } from "sonner";

const Connections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newConnection, setNewConnection] = useState({
    platform: "",
    username: "",
    url: "",
  });

  const platformOptions = [
    {
      id: "github",
      name: "GitHub",
      icon: Github,
      color: "bg-gray-900",
      description: "Connect your GitHub repositories and contributions",
      hasOAuth: true,
      placeholder: "github-username",
      urlPattern: "https://github.com/",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-600",
      description: "Showcase your professional network and experience",
      hasOAuth: false,
      placeholder: "linkedin-profile",
      urlPattern: "https://linkedin.com/in/",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: Youtube,
      color: "bg-red-600",
      description: "Feature your video content and channel",
      hasOAuth: false,
      placeholder: "channel-name",
      urlPattern: "https://youtube.com/@",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "bg-pink-600",
      description: "Display your visual content and creativity",
      hasOAuth: false,
      placeholder: "instagram-handle",
      urlPattern: "https://instagram.com/",
    },
    {
      id: "leetcode",
      name: "LeetCode",
      icon: Code,
      color: "bg-orange-500",
      description: "Show your problem-solving skills and contest rank",
      hasOAuth: false,
      placeholder: "leetcode-username",
      urlPattern: "https://leetcode.com/",
    },
  ];

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const data = await connectionsAPI.getConnections();
      setConnections(data);
    } catch (error) {
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  const getConnectionByPlatform = (platformId: string) => {
    return connections.find((c) => c.platform === platformId);
  };

  const handleManualConnect = async () => {
    try {
      setActionLoading("manual");
      if (!newConnection.platform || !newConnection.username || !newConnection.url) {
        toast.error("Please fill in all fields");
        return;
      }

      await connectionsAPI.createConnection(newConnection);
      toast.success(`${newConnection.platform} connected successfully`);
      setNewConnection({ platform: "", username: "", url: "" });
      fetchConnections();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to connect");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleConnection = async (connection: Connection) => {
    try {
      setActionLoading(connection.id);
      await connectionsAPI.updateConnection(connection.id, {
        isActive: !connection.isActive,
      });
      toast.success(
        `${connection.platform} ${connection.isActive ? "disabled" : "enabled"}`,
      );
      fetchConnections();
    } catch {
      toast.error("Failed to toggle connection");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConnection = async (connection: Connection) => {
    if (!confirm(`Remove ${connection.platform} connection?`)) return;

    try {
      setActionLoading(connection.id);
      await connectionsAPI.deleteConnection(connection.id);
      toast.success(`${connection.platform} removed`);
      fetchConnections();
    } catch {
      toast.error("Failed to delete connection");
    } finally {
      setActionLoading(null);
    }
  };

  const generateUrl = (platform: string, username: string) => {
    const option = platformOptions.find((p) => p.id === platform);
    return option ? `${option.urlPattern}${username}` : "";
  };

  const handleGitHubConnect = async () => {
    try {
      setActionLoading("github");
      sessionStorage.setItem("githubAuthRedirect", "/connections");
      window.location.href = "${import.meta.env.VITE_API_URL}/auth/oauth/github";
    } catch (error) {
      toast.error("Failed to initiate GitHub OAuth");
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-brand">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center mb-8">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Platform Connections
            </h1>
            <p className="text-white/80">
              Manage your developer and social accounts
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {platformOptions.map((platform) => {
            const conn = getConnectionByPlatform(platform.id);
            const Icon = platform.icon;
            const isLoading = actionLoading === platform.id || actionLoading === conn?.id;

            return (
              <Card key={platform.id} className="bg-white/95 shadow-xl border-0">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${platform.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {platform.name}
                          {conn && (
                            <Badge variant={conn.isActive ? "default" : "secondary"}>
                              {conn.isActive ? "Active" : "Inactive"}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{platform.description}</CardDescription>
                      </div>
                    </div>
                    {conn && (
                      <Switch
                        checked={conn.isActive}
                        onCheckedChange={() => handleToggleConnection(conn)}
                        disabled={isLoading}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {conn ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 border rounded">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">
                              @{conn.username}
                            </p>
                            <p className="text-sm text-green-700">
                              Connected on{" "}
                              {new Date(conn.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(conn.url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteConnection(conn)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {conn.metadata && platform.id === "leetcode" && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 bg-gray-50 text-center rounded">
                            <div className="font-semibold">{conn.metadata.solved}</div>
                            <div className="text-gray-600">Solved</div>
                          </div>
                          <div className="p-3 bg-gray-50 text-center rounded">
                            <div className="font-semibold">{conn.metadata.rank}</div>
                            <div className="text-gray-600">Global Rank</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : platform.hasOAuth ? (
                    <Button
                      onClick={handleGitHubConnect}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Connecting...
                        </div>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Connect with OAuth
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        Manual connection required
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Manual Connect Form */}
        <Card className="bg-white/95 shadow-xl border-0">
          <CardHeader>
            <CardTitle>Add Manual Connection</CardTitle>
            <CardDescription>
              Add your LeetCode, LinkedIn, or other profile manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  className="w-full border rounded px-3 py-2"
                  value={newConnection.platform}
                  onChange={(e) => {
                    const platform = e.target.value;
                    const platformOption = platformOptions.find(
                      (p) => p.id === platform,
                    );
                    setNewConnection({
                      ...newConnection,
                      platform,
                      url:
                        platformOption && newConnection.username
                          ? `${platformOption.urlPattern}${newConnection.username}`
                          : "",
                    });
                  }}
                >
                  <option value="">Select platform</option>
                  {platformOptions
                    .filter((p) => !getConnectionByPlatform(p.id))
                    .map((platform) => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="your-username"
                  value={newConnection.username}
                  onChange={(e) => {
                    const username = e.target.value;
                    const platformOption = platformOptions.find(
                      (p) => p.id === newConnection.platform,
                    );
                    setNewConnection({
                      ...newConnection,
                      username,
                      url: platformOption
                        ? `${platformOption.urlPattern}${username}`
                        : "",
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="url">Profile URL</Label>
                <Input
                  id="url"
                  value={newConnection.url}
                  onChange={(e) =>
                    setNewConnection({ ...newConnection, url: e.target.value })
                  }
                />
              </div>
            </div>
            <Button
              onClick={handleManualConnect}
              disabled={
                !newConnection.platform ||
                !newConnection.username ||
                !newConnection.url ||
                actionLoading === "manual"
              }
            >
              {actionLoading === "manual" ? "Adding..." : "Add Connection"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Connections;
