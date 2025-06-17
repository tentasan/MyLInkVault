import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string>("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          let errorMessage = "GitHub authentication failed";

          if (error === "github_oauth_failed") {
            errorMessage = "GitHub OAuth was cancelled or failed";
          } else if (error === "missing_code") {
            errorMessage = "No authorization code received from GitHub";
          } else {
            errorMessage = decodeURIComponent(error);
          }

          setError(errorMessage);
          setStatus("error");
          toast.error("GitHub authentication failed");
          return;
        }

        if (!token) {
          setError("No authentication token received");
          setStatus("error");
          toast.error("GitHub authentication failed");
          return;
        }

        // Save the token and user data
        localStorage.setItem("authToken", token);

        // Fetch user data with the new token to update the auth context
        try {
          const response = await fetch("http://localhost:3001/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem("user", JSON.stringify(userData));
            updateUser(userData);
          }
        } catch (fetchError) {
          console.warn("Failed to fetch user data, but token is valid");
        }

        setStatus("success");
        toast.success("Successfully connected your GitHub account!");

        // Get stored redirect path or default to dashboard
        const redirectPath =
          sessionStorage.getItem("githubAuthRedirect") || "/dashboard";
        sessionStorage.removeItem("githubAuthRedirect");

        // Start countdown and redirect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              window.location.href = redirectPath; // Force full page reload to update auth state
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (err: any) {
        console.error("GitHub callback error:", err);
        const errorMessage = err.message || "GitHub authentication failed";
        setError(errorMessage);
        setStatus("error");
        toast.error("Failed to complete GitHub authentication");
      }
    };

    handleCallback();
  }, [searchParams, updateUser]);

  const handleRetry = () => {
    navigate("/login");
  };

  const handleManualRedirect = () => {
    const redirectPath =
      sessionStorage.getItem("githubAuthRedirect") || "/dashboard";
    sessionStorage.removeItem("githubAuthRedirect");
    window.location.href = redirectPath; // Force full page reload
  };

  return (
    <div className="min-h-screen bg-gradient-brand flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
          {status === "loading" && (
            <>
              <div className="mb-6">
                <RefreshCw className="w-16 h-16 text-brand-blue mx-auto animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Connecting to GitHub...
              </h2>
              <p className="text-gray-600 mb-4">
                Please wait while we securely connect your GitHub account to
                MyLinkVault.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-brand-blue h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                GitHub Connected Successfully! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Your GitHub account has been successfully linked to MyLinkVault.
                We've imported your profile information and repositories.
              </p>
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  Redirecting to your dashboard in:
                </p>
                <div className="text-3xl font-bold text-brand-blue">
                  {countdown}
                </div>
              </div>
              <Button
                onClick={handleManualRedirect}
                className="w-full bg-brand-blue hover:bg-brand-purple"
              >
                Continue to Dashboard
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Authentication Failed
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm font-medium mb-1">
                  Error Details:
                </p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full bg-brand-blue hover:bg-brand-purple"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Back to Homepage
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            Having trouble?{" "}
            <a
              href="mailto:support@mylinkv.com"
              className="text-white hover:text-brand-cream underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubCallback;
