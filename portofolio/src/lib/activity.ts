import { createServerFn } from "@tanstack/react-start";
import { Pool } from "pg";

export type ActivityStatus = "visited" | "clicked" | "downloading" | "installed";

export type ActivityRecord = {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  device: "Desktop" | "Mobile" | "Tablet";
  browser: string;
  os: string;
  status: ActivityStatus;
  lastActivity: string;
};

let pool: Pool | undefined;
let initialized = false;

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
    os TEXT NOT NULL DEFAULT 'Unknown', status TEXT NOT NULL DEFAULT 'visited',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  initialized = true;
}

function userAgentDetails(userAgent: string) {
  const os = /Windows NT 10/.test(userAgent) ? "Windows" : /Mac OS X/.test(userAgent) ? "macOS" : /Android/.test(userAgent) ? "Android" : /iPhone|iPad/.test(userAgent) ? "iOS" : "Unknown";
  const browser = /Edg\//.test(userAgent) ? "Edge" : /Firefox\//.test(userAgent) ? "Firefox" : /Chrome\//.test(userAgent) ? "Chrome" : /Safari\//.test(userAgent) ? "Safari" : "Unknown";
  const device = /iPad|Tablet/.test(userAgent) ? "Tablet" : /Android|iPhone|Mobile/.test(userAgent) ? "Mobile" : "Desktop";
  return { os, browser, device };
}

export const recordActivity = createServerFn({ method: "POST" })
  .inputValidator((data: { status: ActivityStatus; userAgent?: string }) => data)
  .handler(async ({ data }) => {
    await ensureSchema();
    const details = userAgentDetails(data.userAgent ?? "");
    const result = await database().query<{ id: string }>(
      `INSERT INTO portfolio_activity (ip, device, browser, os, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ["Unknown", details.device, details.browser, details.os, data.status],
    );
    return { id: result.rows[0].id };
  });

export const getActivity = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSchema();
  const result = await database().query(`SELECT id, ip, country, country_code AS "countryCode", device, browser, os, status,
    updated_at AS "lastActivity" FROM portfolio_activity ORDER BY updated_at DESC LIMIT 500`);
  return result.rows as ActivityRecord[];
});

export const deleteActivity = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await ensureSchema();
    await database().query("DELETE FROM portfolio_activity WHERE id = $1", [data.id]);
    return { ok: true };
  });
