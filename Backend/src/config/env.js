/**
 * Centralized environment configuration.
 * Every process.env value used across the backend is read here, with safe
 * production defaults so deployment is just "set env vars and start".
 */

const isProd = process.env.NODE_ENV === "production";

/**
 * Build the list of allowed CORS origins.
 * CORS_ORIGINS accepts a comma-separated list:
 *   CORS_ORIGINS=https://perplexity.example.com,https://admin.example.com
 * Falls back to common local dev ports when unset.
 */
function allowedOrigins() {
    if (process.env.CORS_ORIGINS) {
        return process.env.CORS_ORIGINS
            .split(",")
            .map((origin) => origin.trim())
            .filter(Boolean);
    }

    const devOrigins = ["http://localhost:5173", "http://localhost:5174"];
    // Allow the frontend to be reached over the LAN during development too.
    // Fastify-style: keep it deterministic, ignore container-internal IP noise.
    return devOrigins;
}

const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    isProd,

    port: Number(process.env.PORT) || 3002,

    // Publicly reachable base URL of this backend (used in emails etc.)
    apiUrl: (process.env.API_URL || "http://localhost:3002").replace(/\/+$/, ""),

    // Publicly reachable base URL of the frontend (used for share links, emails)
    frontendUrl: (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, ""),

    mongoUri: process.env.MONGODB_URI || "",
    jwtSecret: process.env.JWT_SECRET || "",

    geminiApiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-3.6-flash",

    tavilyApiKey: process.env.TAVILY_API_KEY || "",

    corsOrigins: allowedOrigins(),

    // Cookie settings. In production (HTTPS), the cookie must be Secure and
    // SameSite=None so it works across the frontend/backend domains.
    cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite: process.env.COOKIE_SAMESITE || (isProd ? "none" : "lax"),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT expiresIn
    },
};

export default env;