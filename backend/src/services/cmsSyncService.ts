import dotenv from "dotenv";

dotenv.config();

/**
 * Fire-and-forget sync of an admin's credentials to the Payload CMS, so the
 * same login works in both systems (Phase 1 of the unified-auth design — see
 * docs/superpowers/specs/2026-08-01-payload-cms-integration-design.md).
 *
 * Deliberately non-blocking: a CMS outage must never prevent an admin
 * password reset or admin creation from succeeding in the main app. Errors
 * are logged, not thrown.
 */
export function syncAdminToCms(admin: {
  id: string;
  name: string;
  email: string;
  password: string;
}): void {
  const cmsUrl = process.env.CMS_URL;
  const syncSecret = process.env.CMS_SYNC_SECRET;

  if (!cmsUrl || !syncSecret) {
    console.warn("⚠️ CMS_URL or CMS_SYNC_SECRET not set — skipping CMS user sync");
    return;
  }

  fetch(`${cmsUrl}/api/sync/admin-user`, {
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
