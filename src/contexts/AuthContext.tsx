//authcontext
import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, User } from "../lib/api";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  githubLogin: (code: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Load user from localStorage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authAPI.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem("user", JSON.stringify(currentUser));
          } catch (error: any) {
            console.error("Token validation failed:", error);
            // Only logout if it's an auth error, not a network error
            if (error.response?.status === 401) {
              logout();
              toast.error("Your session has expired. Please log in again.");
            } else {
              // Keep existing user data if it's just a network error
              console.warn("Failed to refresh user data, keeping cached data");
            }
          }
        }
      } catch (error) {
        console.error("Failed to load stored auth:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token: authToken } = response;

      setUser(userData);
      setToken(authToken);

      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Track login event
      console.log("User logged in:", userData.email);
    } catch (error: any) {
      console.error("Login failed:", error);
      // Let the calling component handle the error display
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await authAPI.register(data);
      const { user: userData, token: authToken } = response;

      setUser(userData);
      setToken(authToken);

      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Track registration event
      console.log("User registered:", userData.email);
    } catch (error: any) {
      console.error("Registration failed:", error);
      // Let the calling component handle the error display
      throw error;
    }
  };

  const githubLogin = async (code: string) => {
    try {
      const response = await authAPI.githubCallback(code);
      const { user: userData, token: authToken } = response;

      setUser(userData);
      setToken(authToken);

      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Track GitHub login event
      console.log("User logged in with GitHub:", userData.email);
    } catch (error: any) {
      console.error("GitHub login failed:", error);
      // Let the calling component handle the error display
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Clear any stored redirect paths
    sessionStorage.removeItem("githubAuthRedirect");

    console.log("User logged out");
    toast.success("Logged out successfully");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    try {
      if (token) {
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } catch (error: any) {
      console.error("Failed to refresh user data:", error);
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    githubLogin,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
