import { createServerFn } from "@tanstack/react-start";

// No artificial delay before the installer becomes available.
const DOWNLOAD_DELAY_MS = 0;

/**
 * Creates a server-side download request. The browser uses the returned time
 * to start its download without holding a request open for the full delay.
 */
export const scheduleInstallerDownload = createServerFn({ method: "POST" })
  .inputValidator((data: { visitorId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.visitorId) throw new Error("A visitor ID is required");

    return {
      downloadUrl: "/my.exe",
      availableAt: Date.now() + DOWNLOAD_DELAY_MS,
    };
  });
