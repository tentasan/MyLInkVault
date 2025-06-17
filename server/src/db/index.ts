import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import * as schema from "./schema.js";

config();

const connectionString = process.env.DATABASE_URL!;

// Create the connection
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Test connection
export async function testConnection() {
  try {
    await client`SELECT 1`;
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}
