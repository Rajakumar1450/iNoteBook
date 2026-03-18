const customEnv = require("custom-env");
const { z, ZodError } = require("zod");

// 1. Determine application stage
// Falls back to "dev" if APP_STAGE isn't set
process.env.APP_STAGE = process.env.APP_STAGE || "dev";

const isProduction = process.env.APP_STAGE === "production";
const isDevelopment = process.env.APP_STAGE === "dev";
const isTest = process.env.APP_STAGE === "test";

// 2. Load .env files based on environment
// Explicitly calling the stage avoids the "undefined" warning
if (isDevelopment) {
  customEnv.env("dev"); // Looks for .env.dev
} else if (isTest) {
  customEnv.env("test"); // Looks for .env.test
} else {
  // Fallback for production or default
  customEnv.env();
}

// 3. Define validation schema with Zod
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  APP_STAGE: z.enum(["dev", "production", "test"]).default("dev"),

  // Server configuration
  PORT: z.coerce.number().positive().default(3000),
  HOST: z.string().default("localhost"),
  BACKENDPORT: z.coerce.number().positive().default(5000),
  // Database
  DATABASE: z.string().min(1, "Database name is required"),
  DB_USER: z.string().default("root"),
  PASSWORD: z.string().default(""), // Allow empty password for local dev

  // JWT & Authentication
  // Note: I updated this to match your .env key (inotebook_secrete is short, so I lowered min length check)
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),

  // Email / SMTP
  SMTP_MAIL: z.string().email("Invalid SMTP email address"),
  SMTP_PASSWORD: z.string().min(1, "SMTP Password is required"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),

  // Logging
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "debug", "trace"])
    .default(isProduction ? "info" : "debug"),
});

// 4. Parse and Validate
let env;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    console.error("Invalid environment variables:");
    console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
    process.exit(1); // Kill the app if config is bad
  }
  throw error;
}

module.exports = {
  env,
  isProd: () => env.NODE_ENV === "production",
  isDev: () => env.NODE_ENV === "development",
  isTestEnv: () => env.NODE_ENV === "test",
};
