import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { users, connections } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { generateToken } from "../utils/jwt.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  getGitHubAuthURL,
  exchangeCodeForToken,
  getGitHubUser,
  getGitHubUserRepos,
} from "../utils/github.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// ---------------- GitHub OAuth ----------------
router.get("/oauth/github", (req: Request, res: Response) => {
  const authUrl = getGitHubAuthURL();
  res.redirect(authUrl);
});

router.get("/oauth/github/callback", async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const error = req.query.error as string;

    if (error) {
      console.error("GitHub OAuth error:", error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_oauth_failed`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=missing_code`);
    }

    const accessToken = await exchangeCodeForToken(code);
    const githubUser = await getGitHubUser(accessToken);

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, githubUser.email || `${githubUser.login}@github.local`))
      .limit(1);

    let user;
    if (existingUser) {
      [user] = await db
        .update(users)
        .set({
          github_id: githubUser.id.toString(),
          avatar_url: githubUser.avatar_url,
          ...(githubUser.name && !existingUser.first_name && {
            first_name: githubUser.name.split(" ")[0] || "",
            last_name: githubUser.name.split(" ").slice(1).join(" ") || "",
          }),
          ...(githubUser.bio && !existingUser.bio && { bio: githubUser.bio }),
          ...(githubUser.location && !existingUser.location && { location: githubUser.location }),
          ...(githubUser.blog && !existingUser.website && { website: githubUser.blog }),
          updated_at: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
    } else {
      [user] = await db
        .insert(users)
        .values({
          id: uuidv4(),
          email: githubUser.email || `${githubUser.login}@github.local`,
          github_id: githubUser.id.toString(),
          first_name: githubUser.name?.split(" ")[0] || githubUser.login,
          last_name: githubUser.name?.split(" ").slice(1).join(" ") || "",
          bio: githubUser.bio,
          location: githubUser.location,
          website: githubUser.blog,
          avatar_url: githubUser.avatar_url,
        })
        .returning();
    }

    const [existingConnection] = await db
      .select()
      .from(connections)
      .where(and(eq(connections.user_id, user.id), eq(connections.platform, "github")))
      .limit(1);

    const recentRepos = await getGitHubUserRepos(accessToken, githubUser.login);

    if (existingConnection) {
      await db
        .update(connections)
        .set({
          username: githubUser.login,
          url: githubUser.html_url,
          access_token: accessToken,
          metadata: {
            repos: githubUser.public_repos,
            followers: githubUser.followers,
            following: githubUser.following,
            recentRepos,
          },
          updated_at: new Date(),
        })
        .where(eq(connections.id, existingConnection.id));
    } else {
      await db.insert(connections).values({
        user_id: user.id,
        platform: "github",
        username: githubUser.login,
        url: githubUser.html_url,
        access_token: accessToken,
        metadata: {
          repos: githubUser.public_repos,
          followers: githubUser.followers,
          following: githubUser.following,
          recentRepos,
        },
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return res.redirect(`${process.env.FRONTEND_URL}/auth/github/callback?token=${token}`);
  } catch (err: any) {
    console.error("GitHub OAuth callback error:", err);
    const errorMessage = encodeURIComponent(err.message || "GitHub OAuth failed");
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorMessage}`);
  }
});

// ---------------- User Registration ----------------
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        id: uuidv4(),
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: hashedPassword,
      })
      .returning();

    const token = generateToken({ userId: newUser.id, email: newUser.email });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
      },
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// ---------------- User Login ----------------
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to log in" });
  }
});

// ---------------- Get Current Authenticated User ----------------
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.first_name,
        lastName: users.last_name,
        avatarUrl: users.avatar_url,
        location: users.location,
        website: users.website,
        bio: users.bio,
        publicProfile: users.public_profile,
        showEmail: users.show_email,
        showLocation: users.show_location,
        createdAt: users.created_at,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
