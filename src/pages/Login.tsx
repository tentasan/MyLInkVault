import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import {
  Github,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../lib/api";
import { toast } from "sonner";
import DemoCredentials from "../components/DemoCredentials";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
      toast.success("Welcome back!");
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    if (!isLogin && (!formData.firstName || !formData.lastName)) {
      setError("First name and last name are required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Login successful!");
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        toast.success("Account created successfully!");
      }
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (err: any) {
      console.error("Authentication error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        (isLogin ? "Login failed" : "Registration failed");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    try {
      setLoading(true);

      // Store current location for redirect after OAuth
      sessionStorage.setItem(
        "githubAuthRedirect",
        location.state?.from?.pathname || "/dashboard",
      );

      // Direct redirect to our backend OAuth endpoint which will redirect to GitHub
 window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/oauth/github`;

    } catch (err: any) {
      console.error("GitHub OAuth error:", err);
      const errorMessage = "Failed to initiate GitHub authentication";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-brand flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-brand-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">MLV</span>
            </div>
            <span className="text-white font-semibold text-2xl">
              MyLinkVault
            </span>
          </Link>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isLogin ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Sign in to manage your digital identity"
                : "Join thousands of creators using MyLinkVault"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GitHub OAuth Button */}
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              onClick={handleGithubAuth}
              disabled={loading}
            >
              <Github className="mr-3 h-5 w-5" />
              Continue with GitHub
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login/Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        className="pl-10"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required={!isLogin}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        className="pl-10"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required={!isLogin}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      isLogin
                        ? "Enter your password"
                        : "Create a password (min 6 characters)"
                    }
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-brand-blue hover:bg-brand-purple text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  <>{isLogin ? "Sign in" : "Create account"}</>
                )}
              </Button>
            </form>

            {/* Toggle Login/Register */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="text-brand-blue hover:underline font-medium"
                disabled={loading}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>

            {/* Additional Links */}
            {isLogin && (
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-brand-blue transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            {/* Demo Credentials */}
            {isLogin && (
              <DemoCredentials
                onFillCredentials={(email, password) => {
                  setFormData({ ...formData, email, password });
                }}
              />
            )}

            {/* Privacy Note */}
            <div className="text-center text-xs text-muted-foreground">
              By {isLogin ? "signing in" : "creating an account"}, you agree to
              our{" "}
              <Link to="/terms" className="text-brand-blue hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-brand-blue hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-white/80 hover:text-white text-sm transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
