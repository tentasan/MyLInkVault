import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { users, analytics } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Validation schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
});

const updatePrivacySchema = z.object({
  publicProfile: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showLocation: z.boolean().optional(),
});

// Get user profile (protected)
router.get(
  "/profile",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
          bio: users.bio,
          website: users.website,
          location: users.location,
          title: users.title,
          company: users.company,
          avatarUrl: users.avatar_url,
          publicProfile: users.public_profile,
          showEmail: users.show_email,
          showLocation: users.show_location,
          createdAt: users.created_at,
          updatedAt: users.updated_at,
        })
        .from(users)
        .where(eq(users.id, req.user!.id))
        .limit(1);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  },
);

// Update user profile (protected)
router.put(
  "/profile",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const updateData = updateProfileSchema.parse(req.body);

      const [updatedUser] = await db
        .update(users)
        .set({
          ...(updateData.firstName && { first_name: updateData.firstName }),
          ...(updateData.lastName && { last_name: updateData.lastName }),
          ...(updateData.bio !== undefined && { bio: updateData.bio }),
          ...(updateData.website !== undefined && {
            website: updateData.website || null,
          }),
          ...(updateData.location !== undefined && {
            location: updateData.location,
          }),
          ...(updateData.title !== undefined && { title: updateData.title }),
          ...(updateData.company !== undefined && {
            company: updateData.company,
          }),
          updated_at: new Date(),
        })
        .where(eq(users.id, req.user!.id))
        .returning({
          id: users.id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
          bio: users.bio,
          website: users.website,
          location: users.location,
          title: users.title,
          company: users.company,
          avatarUrl: users.avatar_url,
          publicProfile: users.public_profile,
          showEmail: users.show_email,
          showLocation: users.show_location,
          updatedAt: users.updated_at,
        });

      res.json(updatedUser);
    } catch (error) {
      console.error("Update profile error:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid input data", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
);

// Update privacy settings (protected)
router.put(
  "/profile/privacy",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const privacyData = updatePrivacySchema.parse(req.body);

      const [updatedUser] = await db
        .update(users)
        .set({
          ...(privacyData.publicProfile !== undefined && {
            public_profile: privacyData.publicProfile,
          }),
          ...(privacyData.showEmail !== undefined && {
            show_email: privacyData.showEmail,
          }),
          ...(privacyData.showLocation !== undefined && {
            show_location: privacyData.showLocation,
          }),
          updated_at: new Date(),
        })
        .where(eq(users.id, req.user!.id))
        .returning({
          publicProfile: users.public_profile,
          showEmail: users.show_email,
          showLocation: users.show_location,
        });

      res.json(updatedUser);
    } catch (error) {
      console.error("Update privacy error:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid input data", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to update privacy settings" });
    }
  },
);

// Get public profile by username/id
router.get(
  "/portfolio/:identifier",
  optionalAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifier } = req.params;

      // Try to find user by ID first, then by email
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
          bio: users.bio,
          website: users.website,
          location: users.location,
          title: users.title,
          company: users.company,
          avatarUrl: users.avatar_url,
          publicProfile: users.public_profile,
          showEmail: users.show_email,
          showLocation: users.show_location,
          createdAt: users.created_at,
        })
        .from(users)
        .where(eq(users.id, identifier))
        .limit(1);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Check if profile is public or if user owns this profile
      if (!user.publicProfile && (!req.user || req.user.id !== user.id)) {
        res.status(403).json({ error: "Profile is private" });
        return;
      }

      // Filter sensitive data based on privacy settings
      const publicProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        website: user.website,
        title: user.title,
        company: user.company,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        ...(user.showEmail && { email: user.email }),
        ...(user.showLocation && { location: user.location }),
      };

      // Track profile view (if not the owner viewing)
      if (!req.user || req.user.id !== user.id) {
        try {
          await db.insert(analytics).values({
            user_id: user.id,
            event_type: "profile_view",
            visitor_ip: req.ip,
            user_agent: req.get("User-Agent"),
            referrer: req.get("Referer"),
          });
        } catch (analyticsError) {
          console.error("Failed to track profile view:", analyticsError);
          // Don't fail the request if analytics fails
        }
      }

      res.json(publicProfile);
    } catch (error) {
      console.error("Get public profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  },
);
// Delete account (protected)
router.delete(
  "/delete",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      // Optionally delete associated data like analytics, connections, etc.
      await db.delete(users).where(eq(users.id, userId));

      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  },
);

export default router;
