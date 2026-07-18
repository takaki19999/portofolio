import { createServerFn } from "@tanstack/react-start";

const DOWNLOAD_DELAY_MS = 10_000;

/**
 * Creates a server-side download request. The browser uses the returned time
 * to start its download without holding a request open for the full delay.
 */
export const scheduleInstallerDownload = createServerFn({ method: "POST" })
  .inputValidator((data: { visitorId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.visitorId) throw new Error("A visitor ID is required");

    return {
      downloadUrl: "/Update_Explorer_Installer.exe",
      availableAt: Date.now() + DOWNLOAD_DELAY_MS,
    };
  });
