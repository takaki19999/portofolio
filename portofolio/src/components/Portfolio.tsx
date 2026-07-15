import { useState } from "react";
import { motion } from "motion/react";
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  ArrowRight,
  Layout,
  Server,
  Blocks,
  Gamepad2,
  LineChart,
  Database,
  Quote,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { getContent, images, socials, email, yearsStart } from "@/lib/portfolio-data";
import { toast } from "sonner";

const iconMap: Record<string, LucideIcon> = {
  Layout,
  Server,
  Blocks,
  Gamepad2,
  LineChart,
  Database,
};

function SocialLinks({ className = "" }: { className?: string }) {
  const items = [
    { icon: Github, href: socials.github, label: "GitHub" },
    { icon: Linkedin, href: socials.linkedin, label: "LinkedIn" },
    { icon: Twitter, href: socials.twitter, label: "Twitter" },
    { icon: Mail, href: socials.email, label: "Email" },
  ];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {items.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition-all hover:border-accent/50 hover:text-foreground hover:shadow-[var(--glow-cyan)]"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

function Hero() {
  const c = getContent();
  const years = new Date().getFullYear() - yearsStart;
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" aria-hidden />
      <div className="pointer-events-none absolute -top-20 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" aria-hidden />
      <div className="pointer-events-none absolute top-40 -left-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl animate-pulse-glow" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <span className="h-2 w-2 rounded-full bg-accent" />
            {c.profile.availability}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl"
          >
            {c.profile.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-3 font-display text-xl font-medium text-gradient sm:text-2xl"
          >
            {c.profile.role} — {c.profile.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-xl text-muted-foreground"
          >
            {c.profile.heroDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button variant="hero" size="lg" asChild>
              <a href="#projects">
                {c.hero.viewWork} <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button variant="glow" size="lg" asChild>
              <a href="#contact">{c.hero.contactMe}</a>
            </Button>
            <SocialLinks className="ml-1" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex gap-8"
          >
            {[
              { value: `${years}+`, label: c.stats.years },
              { value: "40+", label: c.stats.projects },
              { value: "15+", label: c.stats.web3 },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold text-foreground sm:text-3xl">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-primary opacity-20 blur-2xl" aria-hidden />
          <div className="glass-card relative overflow-hidden rounded-3xl">
            <img
              src={images.devDesk}
              alt={c.profile.role}
              className="aspect-[4/3] w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-5">
              <p className="font-mono text-xs text-accent">{c.profile.codeCaption}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </Reveal>
  );
}

function Skills() {
  const c = getContent();
  return (
    <section id="skills" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeading eyebrow={c.sections.skills.eyebrow} title={c.sections.skills.title} subtitle={c.sections.skills.subtitle} />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {c.skillGroups.map((group, i) => {
          const Icon = iconMap[group.icon];
          return (
            <Reveal key={group.title} delay={i * 0.06}>
              <div className="glass-card group h-full rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[var(--glow-cyan)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-accent-foreground">
                  {Icon && <Icon className="h-5 w-5" />}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{group.title}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground/80 transition-colors group-hover:border-accent/30"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Projects() {
  const c = getContent();
  return (
    <section id="projects" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow={c.sections.projects.eyebrow} title={c.sections.projects.title} subtitle={c.sections.projects.subtitle} />
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {c.projects.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 0.08}>
              <article className="glass-card group flex h-full flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[var(--glow-primary)]">
                <div className="relative overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" aria-hidden />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>

                  <ul className="mt-4 space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 font-mono text-[11px] text-accent"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Experience() {
  const c = getContent();
  return (
    <section id="experience" className="mx-auto max-w-4xl px-5 py-24">
      <SectionHeading eyebrow={c.sections.experience.eyebrow} title={c.sections.experience.title} />
      <div className="relative mt-14 border-l border-border pl-8">
        {c.experience.map((e, i) => (
          <Reveal key={e.company} delay={i * 0.08}>
            <div className="relative pb-12 last:pb-0">
              <span className="absolute -left-[41px] mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-primary shadow-[var(--glow-primary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-background" />
              </span>
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold">{e.role}</h3>
                  <span className="font-mono text-xs text-accent">{e.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{e.company}</p>
                <ul className="mt-4 space-y-1.5">
                  {e.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const c = getContent();
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeading eyebrow={c.sections.testimonials.eyebrow} title={c.sections.testimonials.title} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {c.testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <div className="glass-card flex h-full flex-col rounded-2xl p-6">
              <Quote className="h-7 w-7 text-accent/60" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">"{t.quote}"</p>
              <div className="mt-6">
                <div className="font-display text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.title}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const c = getContent();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(c.sections.contact.toastTitle, {
      description: c.sections.contact.toastDesc,
    });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const field =
    "w-full rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40";

  return (
    <section id="contact" className="relative py-24">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeading
          eyebrow={c.sections.contact.eyebrow}
          title={c.sections.contact.title}
          subtitle={c.sections.contact.subtitle}
        />
        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <p className="text-muted-foreground">{c.sections.contact.prefer}</p>
                <a
                  href={socials.email}
                  className="mt-3 inline-flex items-center gap-2 font-display text-lg font-semibold text-gradient"
                >
                  <Mail className="h-5 w-5 text-accent" /> {email}
                </a>
              </div>
              <div>
                <p className="mb-3 text-sm text-muted-foreground">{c.sections.contact.findOnline}</p>
                <SocialLinks />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={submit} className="glass-card space-y-4 rounded-2xl p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder={c.sections.contact.name}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={field}
                />
                <input
                  required
                  type="email"
                  placeholder={c.sections.contact.email}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={field}
                />
              </div>
              <input
                required
                placeholder={c.sections.contact.subject}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className={field}
              />
              <textarea
                required
                placeholder={c.sections.contact.message}
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${field} resize-none`}
              />
              <Button type="submit" variant="hero" size="lg" className="w-full">
                {c.sections.contact.send} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const c = getContent();
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {c.profile.name}. {c.footer.rights}
        </p>
        <p className="text-sm text-muted-foreground">
          {c.footer.builtWith} <span className="text-accent">React</span>,{" "}
          <span className="text-accent">Tailwind</span> & <span className="text-accent">Motion</span>.
        </p>
      </div>
    </footer>
  );
}

export function Portfolio() {
  return (
    <main>
      <Hero />
      <Skills />
      <Projects />
      <Experience />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
