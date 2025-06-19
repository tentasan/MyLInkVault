//api.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not defined! Check Vercel env config.");
}

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  website?: string;
  location?: string;
  title?: string;
  company?: string;
  avatarUrl?: string;
  publicProfile: boolean;
  showEmail: boolean;
  showLocation: boolean;
  createdAt: string;
}

export interface Connection {
  id: string;
  platform: "github" | "linkedin" | "youtube" | "instagram";
  username: string;
  url: string;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsOverview {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    totalClicks: number;
    clickThroughRate: number;
    avgSessionDuration: string;
  };
  trends: {
    viewsChange: number;
    visitorsChange: number;
    ctrChange: number;
    durationChange: number;
  };
}

export interface PlatformStats {
  platform: string;
  clicks: number;
  views: number;
  ctr: number;
}

// Auth API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  getGitHubAuthUrl: async () => {
    const response = await api.get("/api/auth/oauth/github");
    return response.data;
  },

  githubCallback: async (code: string) => {
    const response = await api.post("/api/auth/oauth/github/callback", { code });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<User> => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  updatePrivacy: async (data: {
    publicProfile?: boolean;
    showEmail?: boolean;
    showLocation?: boolean;
  }) => {
    const response = await api.put("/users/profile/privacy", data);
    return response.data;
  },

  getPublicProfile: async (userId: string) => {
    const response = await api.get(`/users/portfolio/${userId}`);
    return response.data;
  },
};

// Connections API
export const connectionsAPI = {
  getConnections: async (): Promise<Connection[]> => {
    const response = await api.get("/connections");
    return response.data;
  },

  getPublicConnections: async (userId: string): Promise<Connection[]> => {
    const response = await api.get(`/connections/user/${userId}`);
    return response.data;
  },

  createConnection: async (data: {
    platform: string;
    username: string;
    url: string;
  }) => {
    const response = await api.post("/connections", data);
    return response.data;
  },

  updateConnection: async (
    id: string,
    data: { username?: string; url?: string; isActive?: boolean },
  ) => {
    const response = await api.put(`/connections/${id}`, data);
    return response.data;
  },

  deleteConnection: async (id: string) => {
    await api.delete(`/connections/${id}`);
  },

  trackClick: async (id: string) => {
    const response = await api.post(`/connections/${id}/click`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getOverview: async (timeRange: string = "7d"): Promise<AnalyticsOverview> => {
    const response = await api.get(
      `/analytics/overview?timeRange=${timeRange}`,
    );
    return response.data;
  },

  getPlatformStats: async (
    timeRange: string = "7d",
  ): Promise<PlatformStats[]> => {
    const response = await api.get(
      `/analytics/platforms?timeRange=${timeRange}`,
    );
    return response.data;
  },

  getActivity: async () => {
    const response = await api.get("/analytics/activity");
    return response.data;
  },

  getTrafficSources: async (timeRange: string = "7d") => {
    const response = await api.get(`/analytics/sources?timeRange=${timeRange}`);
    return response.data;
  },

  trackEvent: async (data: {
    userId: string;
    eventType: string;
    platform?: string;
    metadata?: any;
  }) => {
    const response = await api.post("/analytics/track", data);
    return response.data;
  },
};
export const settingsAPI = {
  updateProfile: async (data: any) => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  updatePrivacy: async (data: any) => {
    const response = await api.put("/users/privacy", data);
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await api.put("/users/password", data);
    return response.data;
  },
};


export default api;
