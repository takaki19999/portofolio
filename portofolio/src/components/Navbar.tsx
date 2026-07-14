import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { getContent } from "@/lib/portfolio-data";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLang();
  const c = getContent(lang);

  const links = [
    { label: c.nav.home, href: "#home" },
    { label: c.nav.skills, href: "#skills" },
    { label: c.nav.projects, href: "#projects" },
    { label: c.nav.experience, href: "#experience" },
    { label: c.nav.contact, href: "#contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const LangToggle = ({ className = "" }: { className?: string }) => (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-secondary/60 p-0.5 text-xs ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => setLang("ja")}
        className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
          lang === "ja" ? "bg-gradient-primary text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={lang === "ja"}
      >
        日本語
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
          lang === "en" ? "bg-gradient-primary text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border bg-background/80 backdrop-blur-lg" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#home" className="font-display text-lg font-bold tracking-tight">
          <span className="text-gradient">{lang === "ja" ? "田中" : "Tanaka"}</span>
          <span className="text-foreground">.dev</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <LangToggle className="ml-2" />
          <Button variant="hero" size="sm" asChild className="ml-2">
            <a href="#contact">{c.nav.cta}</a>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LangToggle />
          <button
            className="rounded-md p-2 text-foreground"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
          <div className="flex flex-col px-5 py-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
