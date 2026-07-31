import type { CorsOptions } from "cors";

/**
 * Origins allowed to make browser requests to the API.
 *
 * A wildcard (`cors()` with no options) is deliberately avoided: it lets any
 * website read this API on a visitor's behalf, and the CORS spec forbids a
 * wildcard origin on credentialed requests — which cookie-based auth depends on.
 */
const STATIC_ORIGINS = [
  // Production frontends
  "https://barakah-main.vercel.app",
  "https://barakah-admin-umber.vercel.app",
  // Local development
  "http://localhost:5173", // frontend-main
  "http://localhost:5174", // frontend-admin
  "http://localhost:3000", // cms (Next.js)
];

/**
 * Vercel preview deployments for this team, e.g.
 * https://barakah-main-3qzdikrkf-agripure.vercel.app
 *
 * The `-agripure` team suffix is required so an unrelated Vercel project cannot
 * claim a matching hostname.
 */
const VERCEL_PREVIEW = /^https:\/\/barakah-[a-z0-9-]+-agripure\.vercel\.app$/;

/** Extra origins supplied at deploy time (comma-separated), e.g. a custom domain. */
function envOrigins(): string[] {
  return (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(origin: string): boolean {
  return (
    STATIC_ORIGINS.includes(origin) ||
    envOrigins().includes(origin) ||
    VERCEL_PREVIEW.test(origin)
  );
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // No Origin header: server-to-server calls, health checks, and payment
    // gateway redirects (JazzCash / Bank Alfalah). These are not browser
    // cross-origin requests, so CORS does not apply and they must not be blocked.
    if (!origin) {
      callback(null, true);
      return;
    }

    // Returning `false` omits the CORS headers instead of raising, so a
    // disallowed origin is blocked by the browser rather than 500-ing the API.
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
};
