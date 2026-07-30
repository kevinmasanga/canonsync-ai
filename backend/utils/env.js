/**
 * Validates required environment variables on startup.
 * Call this before any other module that reads process.env.
 * Throws with a clear message listing every missing variable so
 * the server never starts silently misconfigured.
 */

const REQUIRED_VARS = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "WATSONX_API_KEY",
    "WATSONX_URL",
    "WATSONX_PROJECT_ID"
];

export function validateEnv() {
    const missing = REQUIRED_VARS.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables:\n  ${missing.join("\n  ")}\n` +
            `Ensure a .env file exists or the variables are set in the environment.`
        );
    }
}
