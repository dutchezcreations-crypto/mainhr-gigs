/**
 * Configuration & Environment Variable Loader
 * 
 * Safely loads Flutterwave API credentials from environment variables.
 * Throws a clear error during initialization if any required keys are missing.
 */

// Load variables from process.env (or a .env file in standard environments)
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY;
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_ENCRYPTION_KEY = process.env.FLUTTERWAVE_ENCRYPTION_KEY;
const FLUTTERWAVE_ENV = process.env.FLUTTERWAVE_ENV || "sandbox"; // 'sandbox' or 'production'

// Required keys list
const REQUIRED_KEYS = {
  FLUTTERWAVE_PUBLIC_KEY,
  FLUTTERWAVE_SECRET_KEY,
  FLUTTERWAVE_ENCRYPTION_KEY
};

// Validate keys on startup
const missingKeys = Object.entries(REQUIRED_KEYS)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error("❌ [Flutterwave Config Error] Missing required environment variables!");
  console.error("Please set the following keys in your .env or system environment:");
  missingKeys.forEach(key => console.error(`  - ${key}`));
  console.error("\nRefer to your Flutterwave Dashboard -> Settings -> API Keys to retrieve these.\n");
  process.exit(1);
}

module.exports = {
  PUBLIC_KEY: FLUTTERWAVE_PUBLIC_KEY,
  SECRET_KEY: FLUTTERWAVE_SECRET_KEY,
  ENCRYPTION_KEY: FLUTTERWAVE_ENCRYPTION_KEY,
  IS_PRODUCTION: FLUTTERWAVE_ENV.toLowerCase() === "production",
  API_BASE_URL: "https://api.flutterwave.com/v3"
};
