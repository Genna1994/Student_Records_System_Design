import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../../db/schema";
import * as relations from "../../db/relations";

const fullSchema = { ...schema, ...relations };

// Use a module-level cached instance.
// On Vercel, each cold start creates a new connection.
// On warm invocations the cached instance is reused.
let instance: ReturnType<typeof drizzle<typeof fullSchema>> | null = null;
let connectionInstance: mysql.Connection | null = null;

export function getDb() {
  if (instance) return instance;

  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;

  if (!databaseUrl) {
    throw new Error(
      "No database URL found. Set DATABASE_URL in your Vercel environment variables."
    );
  }

  // Use a single connection (not a pool) for serverless environments.
  // Pools keep connections open between invocations and exhaust Railway's limit.
  const connection = mysql.createPool({
    uri: databaseUrl,
    ssl: { rejectUnauthorized: false },
    // Serverless-safe pool settings: small pool, short idle timeout
    waitForConnections: true,
    connectionLimit: 3,
    idleTimeout: 60000,    // release idle connections after 60s
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  instance = drizzle(connection, {
    schema: fullSchema,
    mode: "default",
  });

  return instance;
}
