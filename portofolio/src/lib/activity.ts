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
  downloadPercent: number | null;
  lastActivity: string;
};

export type ActivitySummary = {
  totalVisits: number;
};

export type GoogleUpdateRecord = {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  device: string;
  browser: string;
  os: string;
  firstVisit: string;
  lastVisit: string;
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await database().query("ALTER TABLE portfolio_activity ADD COLUMN IF NOT EXISTS visitor_id TEXT");
  await database().query("ALTER TABLE portfolio_activity ADD COLUMN IF NOT EXISTS app_status TEXT NOT NULL DEFAULT 'not_clicked'");
  await database().query("ALTER TABLE portfolio_activity ADD COLUMN IF NOT EXISTS download_percent INTEGER");
  await database().query("CREATE UNIQUE INDEX IF NOT EXISTS portfolio_activity_visitor_id_key ON portfolio_activity (visitor_id) WHERE visitor_id IS NOT NULL");
  await database().query(`CREATE TABLE IF NOT EXISTS portfolio_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL, ip TEXT NOT NULL DEFAULT 'Unknown',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await database().query("ALTER TABLE portfolio_visits ADD COLUMN IF NOT EXISTS ip TEXT NOT NULL DEFAULT 'Unknown'");
  await database().query(`UPDATE portfolio_visits AS visits
    SET ip = activity.ip
    FROM portfolio_activity AS activity
    WHERE visits.visitor_id = activity.visitor_id
      AND visits.ip = 'Unknown'
      AND activity.ip <> 'Unknown'`);
  await database().query("CREATE INDEX IF NOT EXISTS portfolio_visits_created_at_idx ON portfolio_visits (created_at DESC)");
  await database().query("CREATE INDEX IF NOT EXISTS portfolio_visits_ip_idx ON portfolio_visits (ip)");
  await database().query(`CREATE TABLE IF NOT EXISTS google_update_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ip TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await database().query("CREATE INDEX IF NOT EXISTS google_update_visits_ip_idx ON google_update_visits (ip)");
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
  .inputValidator((data: { visitorId: string; siteStatus: SiteStatus; appStatus?: AppStatus; downloadPercent?: number; userAgent?: string }) => data)
  .handler(async ({ data }) => {
    await ensureSchema();
    const details = userAgentDetails(data.userAgent ?? "");
    const ip = forwardedIp();
    const location = await locationFor(ip);
    const result = await database().query<{ id: string }>(
      `INSERT INTO portfolio_activity (visitor_id, ip, country, country_code, device, browser, os, status, app_status, download_percent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (visitor_id) WHERE visitor_id IS NOT NULL DO UPDATE SET
         ip = EXCLUDED.ip, country = EXCLUDED.country, country_code = EXCLUDED.country_code,
         device = EXCLUDED.device, browser = EXCLUDED.browser, os = EXCLUDED.os,
         status = EXCLUDED.status, app_status = CASE WHEN EXCLUDED.app_status = 'clicked' THEN 'clicked' ELSE portfolio_activity.app_status END,
         download_percent = CASE WHEN $10::INTEGER IS NULL THEN portfolio_activity.download_percent ELSE LEAST(100, GREATEST(COALESCE(portfolio_activity.download_percent, 0), $10::INTEGER)) END,
         updated_at = NOW() RETURNING id`,
      [data.visitorId, ip, location.country, location.countryCode, details.device, details.browser, details.os, data.siteStatus, data.appStatus ?? "not_clicked", data.downloadPercent ?? null],
    );
    return { id: result.rows[0].id };
  });

export const getActivity = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeaders(new Headers({ "Cache-Control": "no-store, max-age=0", Pragma: "no-cache" }));
  await ensureSchema();
  const unresolved = await database().query<{ id: string; ip: string }>("SELECT id, ip FROM portfolio_activity WHERE country = 'Unknown' AND ip <> 'Unknown' LIMIT 25");
  await Promise.all(unresolved.rows.map(async ({ id, ip }) => {
    const location = await locationFor(ip);
    if (location.country !== "Unknown") await database().query("UPDATE portfolio_activity SET country = $1, country_code = $2 WHERE id = $3", [location.country, location.countryCode, id]);
  }));
  const result = await database().query(`SELECT activity.id, activity.ip, activity.country, activity.country_code AS "countryCode", activity.device, activity.browser, activity.os,
    CASE WHEN activity.updated_at > NOW() - INTERVAL '45 seconds' THEN 'active' ELSE 'left' END AS status,
    CASE WHEN activity.app_status = 'clicked' OR EXISTS (
      SELECT 1 FROM google_update_visits AS google_update WHERE google_update.ip = activity.ip
    ) THEN 'clicked' ELSE 'not_clicked' END AS "appStatus",
    activity.download_percent AS "downloadPercent", activity.updated_at AS "lastActivity"
    FROM (
      SELECT DISTINCT ON (ip) *
      FROM portfolio_activity
      ORDER BY ip, updated_at DESC
    ) AS activity
    ORDER BY activity.updated_at DESC LIMIT 500`);
  return result.rows as ActivityRecord[];
});

export const recordVisit = createServerFn({ method: "POST" })
  .inputValidator((data: { visitorId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.visitorId) throw new Error("A visitor ID is required");
    await ensureSchema();
    await database().query("INSERT INTO portfolio_visits (visitor_id, ip) VALUES ($1, $2)", [data.visitorId, forwardedIp()]);
    return { ok: true };
  });

export const getActivitySummary = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeaders(new Headers({ "Cache-Control": "no-store, max-age=0", Pragma: "no-cache" }));
  await ensureSchema();
  const result = await database().query<{ totalVisits: string }>("SELECT COUNT(*)::TEXT AS \"totalVisits\" FROM portfolio_visits");
  return { totalVisits: Number(result.rows[0]?.totalVisits ?? 0) } satisfies ActivitySummary;
});

export const getGoogleUpdateActivity = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeaders(new Headers({ "Cache-Control": "no-store, max-age=0", Pragma: "no-cache" }));
  await ensureSchema();
  const result = await database().query(`SELECT DISTINCT ON (google_update.ip)
    google_update.id, google_update.ip, google_update.created_at AS "lastVisit",
    MIN(google_update.created_at) OVER (PARTITION BY google_update.ip) AS "firstVisit",
    COALESCE(portfolio.country, 'Unknown') AS country, COALESCE(portfolio.country_code, '--') AS "countryCode",
    COALESCE(portfolio.device, 'Unknown') AS device, COALESCE(portfolio.browser, 'Unknown') AS browser,
    COALESCE(portfolio.os, 'Unknown') AS os
    FROM google_update_visits AS google_update
    LEFT JOIN LATERAL (
      SELECT country, country_code, device, browser, os
      FROM portfolio_activity WHERE ip = google_update.ip ORDER BY updated_at DESC LIMIT 1
    ) AS portfolio ON TRUE
    ORDER BY google_update.ip, google_update.created_at DESC LIMIT 500`);
  return result.rows as GoogleUpdateRecord[];
});

export const resetActivityDatabase = createServerFn({ method: "POST" }).handler(async () => {
  await ensureSchema();
  await database().query("TRUNCATE TABLE portfolio_activity, portfolio_visits, google_update_visits");
  return { ok: true };
});

export const deleteActivity = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await ensureSchema();
    await database().query("DELETE FROM portfolio_activity WHERE id = $1", [data.id]);
    return { ok: true };
  });

export const deleteGoogleUpdateActivity = createServerFn({ method: "POST" })
  .inputValidator((data: { ip: string }) => data)
  .handler(async ({ data }) => {
    await ensureSchema();
    await database().query("DELETE FROM google_update_visits WHERE ip = $1", [data.ip]);
    return { ok: true };
  });
