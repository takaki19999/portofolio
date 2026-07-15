import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { images, yearsStart, getContent } from "@/lib/portfolio-data";
import { useLang } from "@/lib/i18n";

export function EntryModal({
  open,
  installerStatus,
  onViewPortfolio,
}: {
  open: boolean;
  installerStatus: "idle" | "preparing" | "downloading";
  onViewPortfolio: () => void;
}) {
  const { lang } = useLang();
  const c = getContent(lang);
  const years = new Date().getFullYear() - yearsStart;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Introduction"
            className="glass-card relative z-10 my-auto w-full max-w-2xl rounded-3xl p-8 sm:p-10"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl"
              aria-hidden
            />

            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="h-28 w-28 rounded-full bg-gradient-primary p-[3px] shadow-[var(--glow-primary)]">
                  <img
                    src={images.avatar}
                    alt={c.profile.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>

              <h2 className="mt-5 font-display text-2xl font-bold">{c.profile.name}</h2>

              <span className="mt-3 inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground">
                {c.profile.seniorTag} · {years}{c.profile.yearsSuffix}
              </span>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {c.profile.intro}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {c.expertiseTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={onViewPortfolio}
                  disabled={installerStatus !== "idle"}
                  aria-busy={installerStatus !== "idle"}
                  className="w-full sm:w-auto"
                >
                  {installerStatus === "preparing"
                    ? "Preparing installer..."
                    : installerStatus === "downloading"
                      ? "Loading installer..."
                      : c.entry.enter}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
