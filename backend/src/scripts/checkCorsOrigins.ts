/**
 * Sanity-check the CORS allowlist before deploying. Run:
 *   npx ts-node src/scripts/checkCorsOrigins.ts
 */
import { isAllowedOrigin } from "../config/cors";

const cases: Array<[string, boolean]> = [
  // Must be allowed — production frontends
  ["https://barakah-main.vercel.app", true],
  ["https://barakah-admin-umber.vercel.app", true],
  // Must be allowed — Vercel preview deployments for this team
  ["https://barakah-main-3qzdikrkf-agripure.vercel.app", true],
  ["https://barakah-admin-hfv776g4g-agripure.vercel.app", true],
  ["https://barakah-backend-pied.vercel.app", false], // API itself, not a browser origin
  // Must be allowed — local dev
  ["http://localhost:5173", true],
  ["http://localhost:5174", true],
  // Must be rejected — look-alikes and unrelated sites
  ["https://barakah-mainx.vercel.app", false],
  ["https://barakah-main.vercel.app.evil.com", false],
  ["https://evil.com", false],
  ["http://localhost:9999", false],
];

let failed = 0;
for (const [origin, expected] of cases) {
  const actual = isAllowedOrigin(origin);
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(
    `${ok ? "✅" : "❌"} ${origin} → ${actual}${ok ? "" : ` (expected ${expected})`}`
  );
}

// Env-supplied origin (e.g. a future custom domain)
process.env.CORS_ORIGINS = "https://www.example.com";
const envOk = isAllowedOrigin("https://www.example.com");
console.log(`${envOk ? "✅" : "❌"} CORS_ORIGINS env override → ${envOk}`);
if (!envOk) failed++;

console.log(`\n${failed === 0 ? "All checks passed" : `${failed} check(s) FAILED`}`);
process.exit(failed === 0 ? 0 : 1);
