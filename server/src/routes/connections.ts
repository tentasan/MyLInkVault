import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { connections, analytics } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Validation schemas
const createConnectionSchema = z.object({
  platform: z.enum(["github", "linkedin", "youtube", "instagram","leetcode"]),
  username: z.string().min(1),
  url: z.string().url(),
});

const updateConnectionSchema = z.object({
  username: z.string().min(1).optional(),
  url: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// Get user's connections (protected)
router.get(
  "/",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userConnections = await db
        .select({
          id: connections.id,
          platform: connections.platform,
          username: connections.username,
          url: connections.url,
          isActive: connections.is_active,
          metadata: connections.metadata,
          createdAt: connections.created_at,
          updatedAt: connections.updated_at,
        })
        .from(connections)
        .where(eq(connections.user_id, req.user!.id))
        .orderBy(desc(connections.created_at));

      res.json(userConnections);
    } catch (error) {
      console.error("Get connections error:", error);
      res.status(500).json({ error: "Failed to get connections" });
    }
  },
);

// Get public connections for a user
router.get(
  "/user/:userId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const userConnections = await db
        .select({
          id: connections.id,
          platform: connections.platform,
          username: connections.username,
          url: connections.url,
          metadata: connections.metadata,
          createdAt: connections.created_at,
        })
        .from(connections)
        .where(
          and(eq(connections.user_id, userId), eq(connections.is_active, true)),
        )
        .orderBy(desc(connections.created_at));

      res.json(userConnections);
    } catch (error) {
      console.error("Get public connections error:", error);
      res.status(500).json({ error: "Failed to get connections" });
    }
  },
);

// Create new connection (protected)
router.post(
  "/",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { platform, username, url } = createConnectionSchema.parse(
        req.body,
      );

      // Check if connection already exists for this platform
      const [existingConnection] = await db
        .select()
        .from(connections)
        .where(
          and(
            eq(connections.user_id, req.user!.id),
            eq(connections.platform, platform),
          ),
        )
        .limit(1);

      if (existingConnection) {
        res
          .status(400)
          .json({ error: "Connection for this platform already exists" });
        return;
      }

      const [newConnection] = await db
        .insert(connections)
        .values({
          user_id: req.user!.id,
          platform,
          username,
          url,
          is_active: true,
        })
        .returning({
          id: connections.id,
          platform: connections.platform,
          username: connections.username,
          url: connections.url,
          isActive: connections.is_active,
          metadata: connections.metadata,
          createdAt: connections.created_at,
        });

      res.status(201).json(newConnection);
    } catch (error) {
      console.error("Create connection error:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid input data", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create connection" });
    }
  },
);

// Update connection (protected)
router.put(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = updateConnectionSchema.parse(req.body);

      // Verify connection belongs to user
      const [existingConnection] = await db
        .select()
        .from(connections)
        .where(
          and(eq(connections.id, id), eq(connections.user_id, req.user!.id)),
        )
        .limit(1);

      if (!existingConnection) {
        res.status(404).json({ error: "Connection not found" });
        return;
      }

      const [updatedConnection] = await db
        .update(connections)
        .set({
          ...(updateData.username && { username: updateData.username }),
          ...(updateData.url && { url: updateData.url }),
          ...(updateData.isActive !== undefined && {
            is_active: updateData.isActive,
          }),
          updated_at: new Date(),
        })
        .where(eq(connections.id, id))
        .returning({
          id: connections.id,
          platform: connections.platform,
          username: connections.username,
          url: connections.url,
          isActive: connections.is_active,
          metadata: connections.metadata,
          updatedAt: connections.updated_at,
        });

      res.json(updatedConnection);
    } catch (error) {
      console.error("Update connection error:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid input data", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update connection" });
    }
  },
);

// Delete connection (protected)
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Verify connection belongs to user
      const [existingConnection] = await db
        .select()
        .from(connections)
        .where(
          and(eq(connections.id, id), eq(connections.user_id, req.user!.id)),
        )
        .limit(1);

      if (!existingConnection) {
        res.status(404).json({ error: "Connection not found" });
        return;
      }

      await db.delete(connections).where(eq(connections.id, id));

      res.status(204).send();
    } catch (error) {
      console.error("Delete connection error:", error);
      res.status(500).json({ error: "Failed to delete connection" });
    }
  },
);

// Track platform click
router.post(
  "/:id/click",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [connection] = await db
        .select({
          userId: connections.user_id,
          platform: connections.platform,
          url: connections.url,
        })
        .from(connections)
        .where(eq(connections.id, id))
        .limit(1);

      if (!connection) {
        res.status(404).json({ error: "Connection not found" });
        return;
      }

      // Track the click
      await db.insert(analytics).values({
        user_id: connection.userId,
        event_type: "platform_click",
        platform: connection.platform,
        visitor_ip: req.ip,
        user_agent: req.get("User-Agent"),
        referrer: req.get("Referer"),
      });

      // Return the URL for redirect
      res.json({ url: connection.url });
    } catch (error) {
      console.error("Track click error:", error);
      res.status(500).json({ error: "Failed to track click" });
    }
  },
);

export default router;
