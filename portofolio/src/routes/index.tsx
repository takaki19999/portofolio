import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { EntryModal } from "@/components/EntryModal";
import { Navbar } from "@/components/Navbar";
import { Portfolio } from "@/components/Portfolio";
import { LanguageProvider } from "@/lib/i18n";
import { recordActivity } from "@/lib/activity";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [modalOpen, setModalOpen] = useState(true);
  useEffect(() => {
    const userAgent = navigator.userAgent;
    void recordActivity({ data: { status: "visited", userAgent } });
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a, button");
      if (link) void recordActivity({ data: { status: "clicked", userAgent } });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Portfolio />
        <EntryModal open={modalOpen} onClose={() => setModalOpen(false)} />
        <Toaster />
      </div>
    </LanguageProvider>
  );
}
