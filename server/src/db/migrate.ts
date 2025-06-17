import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config();

async function main() {
  try {
    console.log("🔄 Running migrations...");

    const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
    const migrationDb = drizzle(migrationClient);

    await migrate(migrationDb, { migrationsFolder: "drizzle" });

    console.log("✅ Migrations completed successfully");
    await migrationClient.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
