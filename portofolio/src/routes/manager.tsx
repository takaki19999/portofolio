import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Bell, Download, Monitor, RefreshCw, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { deleteActivity, getActivity, type ActivityRecord } from "@/lib/activity";

export const Route = createFileRoute("/manager")({ component: Manager });

function relative(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function Manager() {
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const known = useRef(new Map<string, string>());

  const refresh = useCallback(async (notify = false) => {
    try {
      const next = await getActivity();
      const changed = next.filter((record) => known.current.get(record.id) !== `${record.status}:${record.appStatus}:${record.lastActivity}`);
      if (notify && known.current.size && changed.length && "Notification" in window && Notification.permission === "granted") {
        const latest = changed[0];
        const action = latest.status === "left" ? "Visitor left the portfolio" : latest.appStatus === "clicked" ? "Visitor clicked View Portfolio" : "Visitor is active";
        new Notification("Portfolio Manager", {
          body: `${action}: ${latest.ip} - ${latest.country} - ${latest.device} / ${latest.browser}.`,
          requireInteraction: latest.status === "left",
        });
      }
      known.current = new Map(next.map((record) => [record.id, `${record.status}:${record.appStatus}:${record.lastActivity}`]));
      setRecords(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load activity");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(true), 10000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const stats = useMemo(() => ({
    visitors: records.length,
    clicked: records.filter((record) => record.appStatus === "clicked").length,
    active: records.filter((record) => record.status === "active").length,
    left: records.filter((record) => record.status === "left").length,
  }), [records]);
  const cards = [["Visitors", stats.visitors, Users], ["App clicks", stats.clicked, Download], ["Active now", stats.active, Activity], ["Left site", stats.left, ShieldCheck]] as const;

  async function enableNotifications() {
    if (!("Notification" in window)) return toast.error("System notifications are unavailable in this browser");
    const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (permission !== "granted") return toast.error("Allow notifications in both your browser and Windows settings.");
    new Notification("Portfolio Manager", { body: "Windows system notifications are enabled." });
    toast.success("System notifications enabled");
  }

  return <main className="min-h-screen bg-background px-5 py-8 text-foreground"><Toaster richColors />
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex items-center justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-widest text-accent">Portfolio control center</p><h1 className="mt-2 font-display text-3xl font-bold">Manager</h1><p className="mt-1 text-sm text-muted-foreground">One live row per visitor. Presence expires after 45 seconds without a heartbeat.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void enableNotifications()}><Bell className="mr-2 h-4 w-4" />Enable system notifications</Button><Button variant="outline" onClick={() => void refresh()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button><Button asChild variant="hero"><Link to="/">View site</Link></Button></div></header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className="glass-card rounded-2xl p-5"><Icon className="h-5 w-5 text-accent" /><p className="mt-5 text-3xl font-bold">{value.toLocaleString()}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>)}</section>
      <section className="glass-card mt-7 overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-display text-lg font-semibold">Visitor activity</h2><p className="text-sm text-muted-foreground">A visitor becomes Left site after 45 seconds without activity.</p></div><Monitor className="h-5 w-5 text-accent" /></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="p-4">IP</th><th>Country</th><th>Device</th><th>Browser</th><th>OS</th><th>App</th><th>Status</th><th>Last activity</th><th /></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-b border-border/60 last:border-0"><td className="p-4 font-mono text-xs">{record.ip}</td><td>{record.countryCode} - {record.country}</td><td>{record.device}</td><td>{record.browser}</td><td>{record.os}</td><td><span className={`rounded-full px-2 py-1 text-xs ${record.appStatus === "clicked" ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"}`}>{record.appStatus === "clicked" ? "Clicked" : "-"}</span></td><td><span className={`rounded-full px-2 py-1 text-xs ${record.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>{record.status === "active" ? "Active" : "Left site"}</span></td><td className="text-muted-foreground">{relative(record.lastActivity)}</td><td><Button size="icon" variant="ghost" aria-label="Delete record" onClick={async () => { await deleteActivity({ data: { id: record.id } }); setRecords((all) => all.filter((item) => item.id !== record.id)); toast.success("Record deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></td></tr>)}{!loading && !records.length && <tr><td className="p-10 text-center text-muted-foreground" colSpan={9}>No activity has been recorded yet.</td></tr>}{loading && <tr><td className="p-10 text-center text-muted-foreground" colSpan={9}>Loading activity…</td></tr>}</tbody></table></div></section>
    </div>
  </main>;
}
