import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { users, analytics } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Zod validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
});

const updatePrivacySchema = z.object({
  publicProfile: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showLocation: z.boolean().optional(),
});

// GET current authenticated user's profile
router.get("/profile", authenticateToken, async (req: Request, res: Response) => {
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

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// PUT update profile
router.put("/profile", authenticateToken, async (req: Request, res: Response) => {
  try {
    const parsed = updateProfileSchema.parse(req.body);

    if (Object.keys(parsed).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    const updateData = {
      ...(parsed.firstName !== undefined && { first_name: parsed.firstName }),
      ...(parsed.lastName !== undefined && { last_name: parsed.lastName }),
      ...(parsed.bio !== undefined && { bio: parsed.bio }),
      ...(parsed.website !== undefined && { website: parsed.website || null }),
      ...(parsed.location !== undefined && { location: parsed.location }),
      ...(parsed.title !== undefined && { title: parsed.title }),
      ...(parsed.company !== undefined && { company: parsed.company }),
      updated_at: new Date(),
    };

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
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
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// PUT update privacy settings
router.put("/profile/privacy", authenticateToken, async (req: Request, res: Response) => {
  try {
    const parsed = updatePrivacySchema.parse(req.body);

    const [updatedUser] = await db
      .update(users)
      .set({
        ...(parsed.publicProfile !== undefined && {
          public_profile: parsed.publicProfile,
        }),
        ...(parsed.showEmail !== undefined && {
          show_email: parsed.showEmail,
        }),
        ...(parsed.showLocation !== undefined && {
          show_location: parsed.showLocation,
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
    res.status(500).json({ error: "Failed to update privacy settings" });
  }
});

// GET public profile by user ID
router.get("/portfolio/:identifier", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

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

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.publicProfile && (!req.user || req.user.id !== user.id)) {
      return res.status(403).json({ error: "Profile is private" });
    }

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

    if (!req.user || req.user.id !== user.id) {
      try {
        await db.insert(analytics).values({
          user_id: user.id,
          event_type: "profile_view",
          visitor_ip: req.ip,
          user_agent: req.get("User-Agent"),
          referrer: req.get("Referer"),
        });
      } catch (trackingError) {
        console.error("Analytics error:", trackingError);
      }
    }

    res.json(publicProfile);
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

export default router;