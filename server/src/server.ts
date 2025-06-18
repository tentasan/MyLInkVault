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

// ✅ CORRECTED CORS SETUP
app.use(
  cors({
    origin: ["https://my-l-ink-vault.vercel.app"],
    credentials: true,
  }),
);
// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true); // For Render to get real IP addresses

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/analytics", analyticsRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.json({
    name: "MyLinkVault API",
    version: "1.0.0",
    description: "Backend API for MyLinkVault - Digital Identity Management Platform",
    documentation: "/api/docs",
    health: "/health",
  });
});

// ✅ Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);

    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    res.status(500).json({
      error: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { details: err.message }),
    });
  }
);

// ✅ 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// ✅ Start server
async function startServer() {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) throw new Error("Database connection failed");

    app.listen(PORT, () => {
      console.log(`
🚀 MyLinkVault API is live!

📍 URL: http://localhost:${PORT}
🌐 CORS: Allowed from ${FRONTEND_URL}
🗄 DB: Connected
`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// ✅ Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Gracefully shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Gracefully shutting down...");
  process.exit(0);
});

startServer();