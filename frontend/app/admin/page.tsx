"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://kk-engineering-website.onrender.com";
// ==========================================
// TYPES
// ==========================================

type Status = "New" | "Contacted" | "Completed";
type Filter = "All" | Status;

interface Enquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  requirement: string;
  status: Status;
  created_at: string;
}

interface DashboardStats {
  total_enquiries: number;
  today_enquiries: number;
  new_enquiries: number;
  contacted_enquiries: number;
  completed_enquiries: number;
}

interface ToastItem {
  id: number;
  type: "success" | "error";
  text: string;
}

const STATUSES: Status[] = ["New", "Contacted", "Completed"];
const FILTERS: Filter[] = ["All", ...STATUSES];

const STATUS_STYLE: Record<Status, string> = {
  New: "bg-cyan-400/15 text-cyan-300 ring-cyan-400/40",
  Contacted: "bg-amber-400/15 text-amber-300 ring-amber-400/40",
  Completed: "bg-green-400/15 text-green-300 ring-green-400/40",
};
const BAR_STYLE: Record<Status, string> = {
  New: "bg-cyan-400",
  Contacted: "bg-amber-400",
  Completed: "bg-green-400",
};

// ==========================================
// HELPERS
// ==========================================

function timeAgo(date: string) {
  const s = (Date.now() - new Date(date).getTime()) / 1000;
  if (isNaN(s)) return "";
  if (s < 60) return "Just now";
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)} min ago`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)} hr ago`;
  const d = h / 24;
  if (d < 7) return `${Math.floor(d)} day${Math.floor(d) > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString();
}

const initials = (name: string) =>
  (name || "?").split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

function whatsappLink(phone: string, name: string) {
  const digits = phone.replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  const text = `Hello ${name}, this is KK Engineering. Thank you for your enquiry.`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

function useCountUp(target: number, ready: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!ready) return;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ready]);
  return value;
}

function StatCard({ label, value, hint, icon, glow, loading, delay }: {
  label: string; value: number; hint: string; icon: string; glow: string; loading: boolean; delay: number;
}) {
  const n = useCountUp(value, !loading);
  return (
    <div
      className="fade-up group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/25"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl transition group-hover:opacity-80 ${glow}`} />
      <div className="relative flex items-start justify-between">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="f-d relative mt-3 text-4xl font-extrabold">
        {loading ? <span className="inline-block h-9 w-14 animate-pulse rounded bg-white/10" /> : n}
      </p>
      <p className="relative mt-1 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

export default function AdminDashboard() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_enquiries: 0, today_enquiries: 0, new_enquiries: 0, contacted_enquiries: 0, completed_enquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [confirmEnquiry, setConfirmEnquiry] = useState<Enquiry | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const toast = useCallback((type: ToastItem["type"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = useCallback(
    async (source: "first" | "manual" | "auto" = "auto") => {
      if (source === "manual") setRefreshing(true);
      try {
        const response = await fetch(`${API_URL}/api/dashboard/stats`);
        if (!response.ok) throw new Error("Failed to load dashboard");
        const result = await response.json();
        if (result.success) {
          const st = result.stats ?? {};
          setStats({
            total_enquiries: st.total_enquiries ?? 0,
            today_enquiries: st.today_enquiries ?? 0,
            new_enquiries: st.new_enquiries ?? 0,
            contacted_enquiries: st.contacted_enquiries ?? 0,
            completed_enquiries: st.completed_enquiries ?? 0,
          });
          setEnquiries(result.recent_enquiries ?? []);
          setLastUpdated(new Date());
          if (source === "manual") toast("success", "Dashboard refreshed");
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
        if (source !== "auto") toast("error", "Could not load the dashboard. Is the backend running?");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast]
  );

  // ==========================================
  // CHECK LOGIN + AUTO REFRESH
  // ==========================================

  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") !== "true") {
      window.location.href = "/admin/login";
      return;
    }
    loadDashboard("first");
    const id = setInterval(() => loadDashboard("auto"), 60000);
    return () => clearInterval(id);
  }, [loadDashboard]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setConfirmEnquiry(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const updateEnquiryStatus = async (id: number, status: Status) => {
    setUpdatingStatusId(id);
    try {
      const response = await fetch(`${API_URL}/api/enquiries/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.success) {
        setEnquiries((cur) => cur.map((e) => (e.id === id ? { ...e, status } : e)));
        toast("success", `Marked as ${status}`);
        await loadDashboard("auto");
      } else {
        toast("error", result.message || "Unable to update enquiry status.");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast("error", "Unable to connect to the backend.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const deleteEnquiry = async () => {
    if (!confirmEnquiry) return;
    const id = confirmEnquiry.id;
    setDeletingId(id);
    try {
      const response = await fetch(`${API_URL}/api/enquiries/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        toast("success", "Enquiry deleted");
        await loadDashboard("auto");
      } else {
        toast("error", result.message || "Unable to delete enquiry.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast("error", "Unable to connect to the backend.");
    } finally {
      setDeletingId(null);
      setConfirmEnquiry(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "/admin/login";
  };

  // ==========================================
  // FILTER + EXPORT
  // ==========================================

  const filteredEnquiries = enquiries.filter((e) => {
    if (filter !== "All" && e.status !== filter) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return `${e.name} ${e.phone} ${e.email} ${e.requirement} ${e.status}`.toLowerCase().includes(q);
  });

  const tabCount = (f: Filter) => (f === "All" ? enquiries.length : enquiries.filter((e) => e.status === f).length);

  const exportCsv = () => {
    const rows = [
      ["ID", "Name", "Phone", "Email", "Requirement", "Status", "Date"],
      ...filteredEnquiries.map((e) => [e.id, e.name, e.phone, e.email, e.requirement, e.status, e.created_at]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "kk-enquiries.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts: Record<Status, number> = {
    New: stats.new_enquiries, Contacted: stats.contacted_enquiries, Completed: stats.completed_enquiries,
  };
  const pipeTotal = counts.New + counts.Contacted + counts.Completed;
  const pct = (n: number) => (pipeTotal ? (n / pipeTotal) * 100 : 0);

  const actionBtn = "rounded-lg px-3 py-2 text-xs font-semibold transition hover:scale-105";

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="kk relative min-h-screen overflow-x-hidden bg-[#060B14] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        .kk{font-family:'DM Sans',system-ui,sans-serif}
        .f-d{font-family:'Sora','DM Sans',sans-serif;letter-spacing:-.02em}
        .grad{background:linear-gradient(90deg,#22d3ee,#60a5fa,#fb923c,#22d3ee);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:gradshift 6s linear infinite}
        @keyframes gradshift{to{background-position:300% 0}}
        @keyframes fadeup{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes pop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
        @keyframes slidein{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
        @keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-30px)}}
        .fade-up{animation:fadeup .6s cubic-bezier(.2,.7,.2,1) both}
        .pop{animation:pop .25s ease-out both}
        .slide-in{animation:slidein .35s cubic-bezier(.2,.7,.2,1) both}
        .orb{animation:orb 12s ease-in-out infinite}
        :focus-visible{outline:2px solid #fb923c;outline-offset:2px}
        @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      {/* background glow */}
      <div className="orb pointer-events-none fixed -left-32 top-0 h-[26rem] w-[26rem] rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="orb pointer-events-none fixed -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-orange-500/10 blur-[120px]" style={{ animationDelay: "-6s" }} />

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060B14]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="f-d text-xl font-extrabold leading-none">
              KK <span className="grad">ENGINEERING</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin/projects" className="rounded-full border border-cyan-400/50 px-5 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400 hover:text-[#060B14]">
              Projects
            </a>
            <button onClick={handleLogout} className="rounded-full bg-red-500/90 px-5 py-2 text-sm font-semibold transition hover:bg-red-500">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-6 py-10">
        {/* TITLE */}
        <div className="fade-up mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="f-d text-3xl font-extrabold md:text-4xl">
              Dashboard <span className="grad">overview</span>
            </h2>
            <p className="mt-2 text-slate-400">Monitor your customer enquiries and business activity.</p>
          </div>
          {lastUpdated && (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        {/* STATS */}
        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total enquiries" value={stats.total_enquiries} hint="All enquiries" icon="📊" glow="bg-blue-500" loading={loading} delay={0} />
          <StatCard label="Today" value={stats.today_enquiries} hint="Received today" icon="🗓️" glow="bg-violet-500" loading={loading} delay={80} />
          <StatCard label="New" value={stats.new_enquiries} hint="Awaiting contact" icon="🆕" glow="bg-cyan-400" loading={loading} delay={160} />
          <StatCard label="Contacted" value={stats.contacted_enquiries} hint="Customer contacted" icon="📞" glow="bg-amber-400" loading={loading} delay={240} />
          <StatCard label="Completed" value={stats.completed_enquiries} hint="Enquiries completed" icon="✅" glow="bg-green-400" loading={loading} delay={320} />
        </div>

        {/* PIPELINE + BUSINESS */}
        <div className="mb-10 grid gap-5 lg:grid-cols-3">
          <div className="fade-up rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur lg:col-span-2" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center justify-between">
              <h3 className="f-d text-lg font-bold">Enquiry pipeline</h3>
              <span className="text-sm text-slate-400">{pipeTotal ? Math.round(pct(counts.Completed)) : 0}% completed</span>
            </div>
            <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-white/10">
              {STATUSES.map((s) => (
                <div key={s} className={`${BAR_STYLE[s]} transition-all duration-1000 ease-out`} style={{ width: loading ? "0%" : `${pct(counts[s])}%` }} />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              {STATUSES.map((s) => (
                <span key={s} className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${BAR_STYLE[s]}`} />
                  {s} <span className="font-semibold text-white">{counts[s]}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="fade-up rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur" style={{ animationDelay: "480ms" }}>
            <h3 className="f-d text-lg font-bold">Business</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-400">Location</dt>
                <dd className="font-semibold">📍 Pune, operating from Pune</dd>
              </div>
              <div>
                <dt className="text-slate-400">Services</dt>
                <dd className="font-semibold">AC Ducting • HVAC • AC Installation</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* ENQUIRIES */}
        <section className="fade-up rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur" style={{ animationDelay: "560ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
            <div>
              <h2 className="f-d text-xl font-bold">Customer enquiries</h2>
              <p className="mt-1 text-sm text-slate-400">Search and manage customer enquiries.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCsv} disabled={!filteredEnquiries.length} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-40">
                ⬇ Export CSV
              </button>
              <button onClick={() => loadDashboard("manual")} disabled={refreshing} className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:scale-105 disabled:opacity-60">
                <span className={`inline-block ${refreshing ? "animate-spin" : ""}`}>↻</span> {refreshing ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>

          <div className="space-y-4 border-b border-white/10 p-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
              <input
                type="text"
                placeholder="Search by name, phone, email, requirement or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === f ? "bg-gradient-to-r from-orange-500 to-amber-400 text-[#060B14]" : "border border-white/15 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {f} <span className="opacity-70">({tabCount(f)})</span>
                </button>
              ))}
            </div>
            {!loading && (
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-200">{filteredEnquiries.length}</span> of{" "}
                <span className="font-semibold text-slate-200">{enquiries.length}</span> recent enquiries
              </p>
            )}
          </div>

          <div className="space-y-3 p-6">
            {loading &&
              [0, 1, 2, 3].map((n) => <div key={n} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}

            {!loading && filteredEnquiries.length === 0 && (
              <div className="py-14 text-center">
                <div className="text-5xl">📭</div>
                <p className="f-d mt-4 text-xl font-bold">{search || filter !== "All" ? "No matching enquiries" : "No enquiries yet"}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {search || filter !== "All" ? "Try a different search or filter." : "New customer enquiries will appear here."}
                </p>
              </div>
            )}

            {!loading &&
              filteredEnquiries.map((e, i) => (
                <article
                  key={e.id}
                  className="fade-up flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:border-cyan-400/40 hover:bg-white/[0.06] xl:flex-row xl:items-center"
                  style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
                >
                  <div className="flex items-center gap-4 xl:w-[26%]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 font-bold text-[#060B14]">
                      {initials(e.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{e.name}</p>
                      <p className="text-sm text-slate-400">{e.phone}</p>
                      {e.email && <p className="truncate text-xs text-slate-500">{e.email}</p>}
                    </div>
                  </div>

                  <p className="line-clamp-2 flex-1 text-sm leading-6 text-slate-300">{e.requirement || "No requirement given"}</p>

                  <div className="flex items-center gap-3 xl:w-40 xl:flex-col xl:items-start xl:gap-1">
                    <select
                      value={e.status}
                      disabled={updatingStatusId === e.id}
                      onChange={(ev) => updateEnquiryStatus(e.id, ev.target.value as Status)}
                      aria-label={`Status for ${e.name}`}
                      className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold outline-none ring-1 transition disabled:opacity-50 ${STATUS_STYLE[e.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-[#0A1220] text-white">{s}</option>
                      ))}
                    </select>
                    <span className="text-xs text-slate-500" title={new Date(e.created_at).toLocaleString()}>
                      {updatingStatusId === e.id ? "Updating..." : `${timeAgo(e.created_at)} · #${e.id}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a href={`tel:${e.phone}`} className={`${actionBtn} bg-green-600/90 hover:bg-green-600`}>📞 Call</a>
                    <a href={whatsappLink(e.phone, e.name)} target="_blank" rel="noopener noreferrer" className={`${actionBtn} bg-emerald-500/90 hover:bg-emerald-500`}>💬 WhatsApp</a>
                    {e.email && <a href={`mailto:${e.email}`} className={`${actionBtn} bg-blue-600/90 hover:bg-blue-600`}>✉️ Email</a>}
                    <button onClick={() => setConfirmEnquiry(e)} disabled={deletingId === e.id} className={`${actionBtn} bg-red-500/90 hover:bg-red-500 disabled:opacity-50`}>
                      🗑 Delete
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>
      </div>

      {/* DELETE CONFIRMATION */}
      {confirmEnquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => setConfirmEnquiry(null)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" className="pop w-full max-w-md rounded-3xl border border-white/15 bg-[#0A1220] p-8 shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-2xl">🗑</div>
            <h3 id="del-title" className="f-d mt-5 text-2xl font-bold">Delete this enquiry?</h3>
            <p className="mt-2 leading-7 text-slate-400">
              Enquiry <span className="font-semibold text-white">#{confirmEnquiry.id}</span> from{" "}
              <span className="font-semibold text-white">{confirmEnquiry.name}</span> will be permanently deleted. This cannot be undone.
            </p>
            <div className="mt-7 flex gap-3">
              <button onClick={() => setConfirmEnquiry(null)} className="flex-1 rounded-full border border-white/20 py-3 font-semibold transition hover:bg-white/10">Cancel</button>
              <button onClick={deleteEnquiry} disabled={deletingId === confirmEnquiry.id} className="flex-1 rounded-full bg-red-500 py-3 font-semibold transition hover:bg-red-600 disabled:opacity-60">
                {deletingId === confirmEnquiry.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="fixed bottom-5 right-5 z-[120] flex flex-col gap-3" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`slide-in flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl ${t.type === "success" ? "border-green-400/40 bg-green-500/15 text-green-200" : "border-red-400/40 bg-red-500/15 text-red-200"}`}>
            <span>{t.type === "success" ? "✓" : "⚠"}</span>{t.text}
          </div>
        ))}
      </div>
    </main>
  );
}

