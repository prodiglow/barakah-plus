import dotenv from "dotenv";

dotenv.config();

/**
 * Sync of an admin's credentials to the Payload CMS, so the same login works
 * in both systems (Phase 1 of the unified-auth design — see
 * docs/superpowers/specs/2026-08-01-payload-cms-integration-design.md).
 *
 * Returns a promise so callers that must complete the sync before moving on
 * (e.g. a seed script about to call process.exit()) can await it. Callers on
 * a long-running request path (e.g. the admin password-reset controller)
 * should keep calling this fire-and-forget (not awaited) — a CMS outage must
 * never block or fail that request.
 *
 * The returned promise always resolves, never rejects: network/HTTP failures
 * are caught internally and logged, not thrown, so awaiting this is safe and
 * will never surface an unhandled rejection.
 */
export function syncAdminToCms(admin: {
  id: string;
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  const cmsUrl = process.env.CMS_URL;
  const syncSecret = process.env.CMS_SYNC_SECRET;

  if (!cmsUrl || !syncSecret) {
    console.warn("⚠️ CMS_URL or CMS_SYNC_SECRET not set — skipping CMS user sync");
    return Promise.resolve();
  }

  return fetch(`${cmsUrl}/api/sync/admin-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sync-secret": syncSecret,
    },
    body: JSON.stringify({
      adminId: admin.id,
      name: admin.name,
      email: admin.email,
      password: admin.password,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        console.error(`⚠️ CMS user sync failed: HTTP ${res.status} — ${await res.text()}`);
      } else {
        console.log(`✅ CMS user synced for admin ${admin.email}`);
      }
    })
    .catch((err) => {
      console.error("⚠️ CMS user sync request failed:", err.message);
    });
}
