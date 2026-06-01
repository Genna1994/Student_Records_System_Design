import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

// Support both DATABASE_URL (standard) and MYSQL_PUBLIC_URL (Railway default)
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.MYSQL_PUBLIC_URL ||
  "";

if (!databaseUrl && process.env.NODE_ENV === "production") {
  throw new Error(
    "Missing database URL. Set DATABASE_URL or MYSQL_PUBLIC_URL in your environment variables."
  );
}

export const env = {
  appId: optional("APP_ID"),
  appSecret: optional("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl,
};
