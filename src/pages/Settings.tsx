import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navigation from "../components/Navigation";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { settingsAPI, userAPI } from "@/lib/api";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  ArrowLeft,
  Camera,
  Save,
  Eye,
  MapPin,
  Mail,
  Trash2,
} from "lucide-react";

const Settings = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    website: "",
    location: "",
    title: "",
    company: "",
    avatar: "",
  });

  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showEmail: false,
    showLocation: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userAPI.getProfile();
        setProfileData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          bio: data.bio || "",
          website: data.website || "",
          location: data.location || "",
          title: data.title || "",
          company: data.company || "",
          avatar: data.avatarUrl || "",
        });

        setPrivacySettings({
          publicProfile: data.publicProfile ?? true,
          showEmail: data.showEmail ?? false,
          showLocation: data.showLocation ?? true,
        });
      } catch (err) {
        toast.error("Failed to load profile data");
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handlePrivacyChange = (field: string, value: boolean) => {
    setPrivacySettings({ ...privacySettings, [field]: value });
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleSaveProfile = async () => {
    try {
      const {
        firstName,
        lastName,
        bio,
        website,
        location,
        title,
        company,
      } = profileData;

      // Only send fields that have values (non-empty strings)
      const updatePayload = Object.fromEntries(
        Object.entries({
          firstName,
          lastName,
          bio,
          website,
          location,
          title,
          company,
        }).filter(([, value]) => value !== "")
      );

      await settingsAPI.updateProfile(updatePayload);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const handleSavePrivacy = async () => {
    try {
      await settingsAPI.updatePrivacy(privacySettings);
      toast.success("Privacy settings saved!");
    } catch (err) {
      toast.error("Failed to save privacy settings");
    }
  };

  const handleChangePassword = async () => {
    try {
      await settingsAPI.changePassword(passwordData);
      toast.success("Password changed!");
    } catch (err) {
      toast.error("Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await settingsAPI.deleteAccount();
      toast.success("Your account has been deleted");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      toast.error("Failed to delete account");
      console.error("Delete account error:", err);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-brand">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-white/80">
              Manage your profile and privacy settings
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="bg-brand-blue text-white text-xl">
                    {profileData.firstName[0]}
                    {profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" disabled>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo (Coming soon)
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      handleProfileChange("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleProfileChange("lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">
                  {profileData.email || "Not available"}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={profileData.title}
                    onChange={(e) =>
                      handleProfileChange("title", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) =>
                      handleProfileChange("company", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) =>
                      handleProfileChange("website", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) =>
                      handleProfileChange("location", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                className="bg-brand-blue hover:bg-brand-purple"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see your information and profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-brand-blue" />
                    <Label htmlFor="publicProfile" className="font-medium">
                      Public Profile
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to everyone
                  </p>
                </div>
                <Switch
                  id="publicProfile"
                  checked={privacySettings.publicProfile}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("publicProfile", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-brand-blue" />
                    <Label htmlFor="showEmail" className="font-medium">
                      Show Email
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Display your email address on your public profile
                  </p>
                </div>
                <Switch
                  id="showEmail"
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("showEmail", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-brand-blue" />
                    <Label htmlFor="showLocation" className="font-medium">
                      Show Location
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Display your location on your public profile
                  </p>
                </div>
                <Switch
                  id="showLocation"
                  checked={privacySettings.showLocation}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("showLocation", checked)
                  }
                />
              </div>

              <Button
                onClick={handleSavePrivacy}
                className="bg-brand-blue hover:bg-brand-purple"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-600">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;