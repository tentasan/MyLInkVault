import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "dotenv";
import { testConnection } from "./db/index.js";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import connectionRoutes from "./routes/connections.js";
import analyticsRoutes from "./routes/analytics.js";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP addresses
app.set("trust proxy", true);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/analytics", analyticsRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "MyLinkVault API",
    version: "1.0.0",
    description:
      "Backend API for MyLinkVault - Digital Identity Management Platform",
    documentation: "/api/docs",
    health: "/health",
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);

    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    res.status(500).json({
      error: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { details: err.message }),
    });
  },
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error("Database connection failed");
    }

    app.listen(PORT, () => {
      console.log(`
🚀 MyLinkVault API Server Started Successfully!

📍 Server URL: http://localhost:${PORT}
🗄️ Database: Connected to Supabase PostgreSQL
🔐 Auth: JWT + GitHub OAuth Ready
🌐 CORS: Enabled for ${FRONTEND_URL}

📋 Available Endpoints:
   GET  /                     - API Info
   GET  /health               - Health Check
   
   🔑 Authentication:
   POST /api/auth/register    - User Registration
   POST /api/auth/login       - User Login
   GET  /api/auth/oauth/github - GitHub OAuth URL
   POST /api/auth/oauth/github/callback - GitHub OAuth Callback
   GET  /api/auth/me          - Get Current User
   
   👤 User Management:
   GET  /api/users/profile    - Get User Profile
   PUT  /api/users/profile    - Update Profile
   PUT  /api/users/profile/privacy - Update Privacy Settings
   GET  /api/users/portfolio/:id - Get Public Profile
   
   🔗 Connections:
   GET  /api/connections      - Get User Connections
   POST /api/connections      - Create Connection
   PUT  /api/connections/:id  - Update Connection
   DELETE /api/connections/:id - Delete Connection
   GET  /api/connections/user/:userId - Get Public Connections
   POST /api/connections/:id/click - Track Platform Click
   
   📊 Analytics:
   GET  /api/analytics/overview - Analytics Overview
   GET  /api/analytics/platforms - Platform Statistics
   GET  /api/analytics/activity - Recent Activity
   GET  /api/analytics/sources - Traffic Sources
   POST /api/analytics/track   - Track Custom Event

Environment: ${process.env.NODE_ENV || "development"}
`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server gracefully...");
  process.exit(0);
});

startServer();
