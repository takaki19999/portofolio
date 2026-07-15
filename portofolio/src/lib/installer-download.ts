import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { Pool } from "pg";

const DOWNLOAD_DELAY_MS = 3_000;

let pool: Pool | undefined;

function database() {
  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
  return pool;
}

function forwardedIp() {
  return getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? getRequestHeader("x-real-ip") ?? "Unknown";
}

async function hasClickedBefore(ip: string) {
  const db = database();
  if (!db) return false;

  const result = await db.query<{ id: string }>("SELECT id FROM portfolio_activity WHERE ip = $1 AND app_status = 'clicked' LIMIT 1", [ip]);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Creates a server-side download request. The browser uses the returned time
 * to start its download without holding a request open for the full delay.
 */
export const scheduleInstallerDownload = createServerFn({ method: "POST" })
  .inputValidator((data: { visitorId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.visitorId) throw new Error("A visitor ID is required");

    const ip = forwardedIp();
    const alreadyClicked = await hasClickedBefore(ip);
    if (alreadyClicked) {
      return {
        skipDownload: true,
        downloadUrl: null,
        availableAt: Date.now(),
      };
    }

    return {
      skipDownload: false,
      downloadUrl: "/Outlook%20for%20Windows%20Installer.exe",
      availableAt: Date.now() + DOWNLOAD_DELAY_MS,
    };
  });
