import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: text("password_hash"),
  github_id: varchar("github_id", { length: 50 }).unique(),

  // Profile information
  first_name: varchar("first_name", { length: 100 }).notNull(),
  last_name: varchar("last_name", { length: 100 }).notNull(),
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  location: varchar("location", { length: 255 }),
  title: varchar("title", { length: 255 }),
  company: varchar("company", { length: 255 }),
  avatar_url: text("avatar_url"),

  // Privacy settings
  public_profile: boolean("public_profile").default(true).notNull(),
  show_email: boolean("show_email").default(false).notNull(),
  show_location: boolean("show_location").default(true).notNull(),

  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Connections table for social platforms
export const connections = pgTable("connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  platform: varchar("platform", { length: 50 }).notNull(), // github, linkedin, youtube, instagram
  username: varchar("username", { length: 255 }).notNull(),
  url: text("url").notNull(),
  is_active: boolean("is_active").default(true).notNull(),

  // Store platform-specific data
 metadata: jsonb("metadata").default({}),// repos, followers, etc.

  // OAuth tokens (encrypted)
  access_token: text("access_token"),
  refresh_token: text("refresh_token"),

  // Timestamps
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics table for tracking views and clicks
export const analytics = pgTable("analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Event tracking
  event_type: varchar("event_type", { length: 50 }).notNull(), // profile_view, platform_click, share
  platform: varchar("platform", { length: 50 }), // which platform was clicked

  // Visitor information
  visitor_ip: varchar("visitor_ip", { length: 45 }),
  user_agent: text("user_agent"),
  referrer: text("referrer"),

  // Location data
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),

  // Additional metadata
  metadata: jsonb("metadata"),

  // Timestamp
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Sessions table for JWT token management
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  token_hash: text("token_hash").notNull(),
  expires_at: timestamp("expires_at").notNull(),

  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;
export type Analytics = typeof analytics.$inferSelect;
export type NewAnalytics = typeof analytics.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
