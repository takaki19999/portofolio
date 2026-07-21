import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeaders } from "@tanstack/react-start/server";
import { Pool } from "pg";

export type SiteStatus = "active" | "left";
export type AppStatus = "not_clicked" | "clicked";

export type ActivityRecord = {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  device: "Desktop" | "Mobile" | "Tablet";
  browser: string;
  os: string;
  status: SiteStatus;
  appStatus: AppStatus;
  clickCount: number;
  downloadPercent: number | null;
  lastActivity: string;
};

let pool: Pool | undefined;
let initialized = false;
const locationCache = new Map<string, { country: string; countryCode: string }>();

function database() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Add a PostgreSQL service in Railway and link its DATABASE_URL variable.");
  }
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
  return pool;
}

async function ensureSchema() {
  if (initialized) return;
  await database().query(`CREATE TABLE IF NOT EXISTS portfolio_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ip TEXT NOT NULL DEFAULT 'Unknown',
    country TEXT NOT NULL DEFAULT 'Unknown', country_code TEXT NOT NULL DEFAULT '--',
    device TEXT NOT NULL DEFAULT 'Desktop', browser TEXT NOT NULL DEFAULT 'Unknown',
    os TEXT NOT NULL DEFAULT 'Unknown', status TEXT NOT NULL DEFAULT 'active',
    visitor_id TEXT, app_status TEXT NOT NULL DEFAULT 'not_clicked', download_percent INTEGER,
    click_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await database().query("ALTER TABLE portfolio_activity ADD COLUMN IF NOT EXISTS visitor_id TEXT");
  await database().query("ALTER TABLE portfolio_activity ADD COLUMN IF NOT EXISTS app_status TEXT NOT NULL DEFAULT 'not_clicked'");
  await database().query("ALTER TABLE portfolio_activity ADD COLUMN IF NOT EXISTS download_percent INTEGER");
  await database().query("ALTER TABLE portfolio_activity ADD COLUMN IF NOT EXISTS click_count INTEGER NOT NULL DEFAULT 0");
  // A browser can receive a new visitor ID after its storage is cleared, but it
  // should still update its existing row when it comes from the same IP.
  // Keep the most recently active record before adding the IP uniqueness rule.
  await database().query(`DELETE FROM portfolio_activity AS older
    USING portfolio_activity AS newer
    WHERE older.ip = newer.ip
      AND older.ip <> 'Unknown'
      AND (older.updated_at, older.id) < (newer.updated_at, newer.id)`);
  await database().query("DROP INDEX IF EXISTS portfolio_activity_visitor_id_key");
  await database().query("CREATE UNIQUE INDEX IF NOT EXISTS portfolio_activity_ip_key ON portfolio_activity (ip) WHERE ip <> 'Unknown'");
  initialized = true;
}

function forwardedIp() {
  return getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? getRequestHeader("x-real-ip") ?? "Unknown";
}

async function locationFor(ip: string) {
  if (ip === "Unknown" || ip === "127.0.0.1" || ip === "::1") return { country: "Unknown", countryCode: "--" };
  const cached = locationCache.get(ip);
  if (cached) return cached;
  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { signal: AbortSignal.timeout(2500) });
    const data = await response.json() as { country_name?: string; country_code?: string };
    if (data.country_name && data.country_code) {
      const location = { country: data.country_name, countryCode: data.country_code };
      locationCache.set(ip, location);
      return location;
    }
  } catch { /* Fall through to the secondary provider. */ }
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(2500) });
    const data = await response.json() as { success?: boolean; country?: string; country_code?: string };
    if (data.success !== false && data.country && data.country_code) {
      const location = { country: data.country, countryCode: data.country_code };
      locationCache.set(ip, location);
      return location;
    }
  } catch { /* The table will retry on the next activity refresh. */ }
  return { country: "Unknown", countryCode: "--" };
}

function userAgentDetails(userAgent: string) {
  const os = /Windows NT 10/.test(userAgent) ? "Windows" : /Mac OS X/.test(userAgent) ? "macOS" : /Android/.test(userAgent) ? "Android" : /iPhone|iPad/.test(userAgent) ? "iOS" : "Unknown";
  const browser = /Edg\//.test(userAgent) ? "Edge" : /Firefox\//.test(userAgent) ? "Firefox" : /Chrome\//.test(userAgent) ? "Chrome" : /Safari\//.test(userAgent) ? "Safari" : "Unknown";
  const device = /iPad|Tablet/.test(userAgent) ? "Tablet" : /Android|iPhone|Mobile/.test(userAgent) ? "Mobile" : "Desktop";
  return { os, browser, device };
}

export const recordActivity = createServerFn({ method: "POST" })
  .inputValidator((data: { visitorId: string; siteStatus: SiteStatus; appStatus?: AppStatus; downloadPercent?: number; portfolioClick?: boolean; userAgent?: string }) => data)
  .handler(async ({ data }) => {
    await ensureSchema();
    const details = userAgentDetails(data.userAgent ?? "");
    const ip = forwardedIp();
    const location = await locationFor(ip);
    const result = await database().query<{ id: string; clickCount: number }>(
      `INSERT INTO portfolio_activity (visitor_id, ip, country, country_code, device, browser, os, status, app_status, download_percent, click_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (ip) WHERE ip <> 'Unknown' DO UPDATE SET
         visitor_id = EXCLUDED.visitor_id, country = EXCLUDED.country, country_code = EXCLUDED.country_code,
         device = EXCLUDED.device, browser = EXCLUDED.browser, os = EXCLUDED.os,
         status = EXCLUDED.status, app_status = CASE WHEN EXCLUDED.app_status = 'clicked' THEN 'clicked' ELSE portfolio_activity.app_status END,
         download_percent = CASE WHEN $10::INTEGER IS NULL THEN portfolio_activity.download_percent ELSE LEAST(100, GREATEST(COALESCE(portfolio_activity.download_percent, 0), $10::INTEGER)) END,
         click_count = portfolio_activity.click_count + EXCLUDED.click_count,
         updated_at = NOW() RETURNING id, click_count AS "clickCount"`,
      [data.visitorId, ip, location.country, location.countryCode, details.device, details.browser, details.os, data.siteStatus, data.appStatus ?? "not_clicked", data.downloadPercent ?? null, data.portfolioClick ? 1 : 0],
    );
    return result.rows[0];
  });

export const getActivity = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeaders(new Headers({ "Cache-Control": "no-store, max-age=0", Pragma: "no-cache" }));
  await ensureSchema();
  const unresolved = await database().query<{ id: string; ip: string }>("SELECT id, ip FROM portfolio_activity WHERE country = 'Unknown' AND ip <> 'Unknown' LIMIT 25");
  await Promise.all(unresolved.rows.map(async ({ id, ip }) => {
    const location = await locationFor(ip);
    if (location.country !== "Unknown") await database().query("UPDATE portfolio_activity SET country = $1, country_code = $2 WHERE id = $3", [location.country, location.countryCode, id]);
  }));
  const result = await database().query(`SELECT id, ip, country, country_code AS "countryCode", device, browser, os,
    CASE WHEN updated_at > NOW() - INTERVAL '45 seconds' THEN 'active' ELSE 'left' END AS status,
    app_status AS "appStatus", click_count AS "clickCount", download_percent AS "downloadPercent", updated_at AS "lastActivity"
    FROM portfolio_activity ORDER BY updated_at DESC LIMIT 500`);
  return result.rows as ActivityRecord[];
});

export const deleteActivity = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await ensureSchema();
    await database().query("DELETE FROM portfolio_activity WHERE id = $1", [data.id]);
    return { ok: true };
  });

export const resetActivity = createServerFn({ method: "POST" }).handler(async () => {
  await ensureSchema();
  await database().query("DELETE FROM portfolio_activity");
  return { ok: true };
});
