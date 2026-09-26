"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const PHONE_NUMBER = "6205346480";
const WHATSAPP_NUMBER = "916205346480";

const NAV = [["home", "Home"], ["about", "About"], ["services", "Services"], ["projects", "Projects"], ["why", "Why Us"], ["areas", "Areas"], ["faq", "FAQ"], ["contact", "Contact"]];
// emoji, sector name (shown in the rotating hero headline)
const SECTORS = [
  ["🏢", "Commercial & Offices"],
  ["🏨", "Hotels & Hospitality"],
  ["🏭", "Industrial Facilities"],
  ["🏥", "Healthcare"],
  ["🛍️", "Retail & Public Spaces"],
];

// icon, title, text, grid span
const SERVICES = [
  ["❄️", "AC Ducting", "Duct installation and related ducting work for building projects.", "md:col-span-2"],
  ["🏢", "HVAC Installation", "Installation support for offices, commercial buildings and industrial spaces.", ""],
  ["🔧", "HVAC Duct Work", "Duct fabrication, installation and project-related HVAC work.", ""],
  ["🏗️", "Building Projects", "HVAC and ducting for construction and development projects.", "md:col-span-2"],
  ["🏭", "Industrial HVAC", "HVAC and ducting services for industrial requirements.", ""],
  ["📋", "Contract Work", "Contract-based work for companies, builders and individual customers.", "md:col-span-2"],
];

// Edit to match how you really work.
const STEPS = [
  ["Site visit", "We check the space and understand your requirement."],
  ["Planning", "Duct routes and sizes are planned for the building."],
  ["Fabrication", "Ducts are made to the required size."],
  ["Installation", "Ducts are fitted, checked and handed over."],
];

const WHY = [
  ["🔧", "Project-focused work", "Work is planned according to the requirements of each project."],
  ["🏢", "Multiple project types", "We support commercial, industrial and building projects."],
  ["🤝", "Contract support", "We work with builders, companies and individual customers."],
  ["📍", "Pune based", "Based in Pune and available for relevant HVAC and ducting projects."],
];

// Edit this list to the areas you really serve.
const AREAS = ["Pune City", "Hinjewadi", "Wakad", "Baner", "Kharadi", "Hadapsar", "Pimpri-Chinchwad", "Kothrud", "Viman Nagar", "Chakan"];

const FAQS = [
  ["Which services does KK Engineering offer?", "We do AC ducting, HVAC installation, HVAC duct work, building projects, industrial HVAC and contract work."],
  ["Who do you work for?", "We take work from builders, companies, industries and individual customers."],
  ["How do I get a quote?", "Fill in the quote form on this page, message us on WhatsApp or call us. Tell us the service, your location and a few details about the project."],
  ["Do you work outside Pune?", "We are based in Pune. Share your location with us and we will confirm whether we can take the project."],
  ["How long will my project take?", "It depends on the size and type of work. We can give you an idea once we understand your requirement."],
  ["Can I contact you on WhatsApp?", "Yes. Use the WhatsApp button on this page and your message opens ready to send."],
];

function getImageUrl(imageUrl: string) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_URL}${imageUrl}`;
}

interface Project {
  id: number;
  name: string;
  location: string;
  service: string;
  description: string;
  image_url: string;
  status: string;
  created_at: string;
}

/* Particle "airflow" that streams across the hero and swirls away from the mouse */
function AirCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, t = 0;
    const mouse = { x: -999, y: -999 };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#05070D"; ctx.fillRect(0, 0, w, h);
    };
    resize();
    const mk = () => ({ x: Math.random() * w, y: Math.random() * h, v: 0.8 + Math.random() * 2.2, a: Math.random() * 6.28, s: 0.6 + Math.random() * 1.6 });
    const ps = Array.from({ length: w < 700 ? 70 : 150 }, mk);
    const move = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("resize", resize);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      t += 0.01;
      ctx.fillStyle = "rgba(5,7,13,0.16)";
      ctx.fillRect(0, 0, w, h);
      for (const p of ps) {
        const px = p.x, py = p.y;
        p.x += p.v;
        p.y += Math.sin(p.x * 0.008 + t + p.a) * 0.9;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d > 0 && d < 150) { p.x += (dx / d) * (150 - d) * 0.07; p.y += (dy / d) * (150 - d) * 0.07; }
        if (p.x > w + 10 || p.y < -10 || p.y > h + 10) Object.assign(p, mk(), { x: -10 });
        ctx.strokeStyle = p.s > 1.8 ? `rgba(255,140,50,${0.3 + p.s * 0.2})` : p.s > 1.1 ? `rgba(96,165,250,${0.25 + p.s * 0.25})` : `rgba(103,232,249,${0.25 + p.s * 0.3})`;
        ctx.lineWidth = p.s;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      if (!still) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

/* Fades and slides content in when it scrolls into view */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ease-out ${show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"} ${className}`}>
      {children}
    </div>
  );
}

/* 3D tilt + cursor spotlight card */
function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current!, r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-6px)`;
        el.style.setProperty("--x", `${(x + 0.5) * 100}%`);
        el.style.setProperty("--y", `${(y + 0.5) * 100}%`);
      }}
      onMouseLeave={() => { ref.current!.style.transform = ""; }}
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_20px_60px_-25px_rgba(0,0,0,.8)] backdrop-blur transition-[transform,border-color] duration-200 will-change-transform hover:border-cyan-300/50 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(380px circle at var(--x,50%) var(--y,50%), rgba(103,232,249,.17), transparent 60%)" }} />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/* Numbered section heading */
function Head({ n, label, sub, children }: { n: string; label: string; sub?: string; children: React.ReactNode }) {
  return (
    <Reveal className="max-w-3xl">
      <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.25em] text-cyan-300">
        <span className="h-px w-10 bg-cyan-300/60" />{n} / {label.toUpperCase()}
      </p>
      <h2 className="f-d text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[1.04]">{children}</h2>
      {sub && <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">{sub}</p>}
    </Reveal>
  );
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryService, setEnquiryService] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquiryLocation, setEnquiryLocation] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [formError, setFormError] = useState("");
  const [word, setWord] = useState(0);
  const [progress, setProgress] = useState(0);
  const [intro, setIntro] = useState(true);
  const glow = useRef<HTMLDivElement>(null);

  // Short brand intro, shown once per visit
  useEffect(() => {
    let seen = false;
    try { seen = !!sessionStorage.getItem("kk-intro"); sessionStorage.setItem("kk-intro", "1"); } catch {}
    if (seen) { setIntro(false); return; }
    const t = setTimeout(() => setIntro(false), 1900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects`);
        const result = await response.json();
        if (result.success) setProjects(result.data);
        else setProjectsError(true);
      } catch (error) {
        console.error("Unable to load projects:", error);
        setProjectsError(true);
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setWord((w) => (w + 1) % SECTORS.length), 2200);
    const onScroll = () => {
      const h = document.documentElement;
      setProgress((h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100);
    };
    const onMove = (e: MouseEvent) => {
      if (glow.current) glow.current.style.transform = `translate(${e.clientX - 200}px,${e.clientY - 200}px)`;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setContactOpen(false); setMenuOpen(false); }
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const openWhatsApp = (message?: string) => {
    const text = message || "Hello KK Engineering, I am interested in your HVAC / AC ducting services.";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const openEnquiryForm = () => { setContactOpen(false); scrollToSection("quote"); };

  const submitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName.trim()) return setFormError("Enter your name.");
    if (enquiryPhone.replace(/\D/g, "").length < 10) return setFormError("Enter a valid 10-digit phone number.");
    if (!enquiryService) return setFormError("Select a service.");
    setFormError("");
    setSending(true);
    // Save the lead on the backend; WhatsApp still opens if this fails.
    try {
      await fetch(`${API_URL}/api/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: enquiryName, phone: enquiryPhone, service: enquiryService, location: enquiryLocation, message: enquiryMessage }),
      });
    } catch (err) {
      console.error("Could not save quote request:", err);
    }
    openWhatsApp(`
Hello KK Engineering,

I would like a quote.

Name: ${enquiryName}
Customer Phone: ${enquiryPhone}
Service Required: ${enquiryService}
Location: ${enquiryLocation || "Not given"}
Message: ${enquiryMessage || "No additional message"}

Please contact me regarding my requirement.

Thank you.
    `.trim());
    setSending(false);
    setSent(true);
    setEnquiryName(""); setEnquiryPhone(""); setEnquiryService(""); setEnquiryLocation(""); setEnquiryMessage("");
  };

  const field = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30";
  const label = "mb-2 block text-sm font-semibold text-slate-300";
  const btnPrimary = "rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-8 py-4 font-bold text-[#05070D] shadow-[0_10px_40px_-8px_rgba(255,122,26,.7)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-8px_rgba(255,122,26,.9)]";
  const btnGhost = "rounded-full border border-white/25 bg-white/5 px-8 py-4 font-bold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15";

  return (
    <main className="kk min-h-screen overflow-x-hidden bg-[#05070D] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=DM+Sans:wght@400;500;700&display=swap');
        .kk{font-family:'DM Sans',system-ui,sans-serif;background-image:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1px);background-size:30px 30px}
        .f-d{font-family:'Bricolage Grotesque','DM Sans',sans-serif;letter-spacing:-.03em}
        .grad{background:linear-gradient(90deg,#67e8f9,#60a5fa,#a78bfa,#67e8f9);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:gradshift 6s linear infinite}
        .warm{background:linear-gradient(90deg,#fb923c,#fbbf24);-webkit-background-clip:text;background-clip:text;color:transparent}
        .ol{color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.4)}
        ::selection{background:#67e8f9;color:#05070D}
        ::-webkit-scrollbar{width:10px}::-webkit-scrollbar-track{background:#05070D}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:10px}
        @keyframes gradshift{to{background-position:300% 0}}
        @keyframes rise{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
        @keyframes swap{from{opacity:0;transform:translateY(60%) rotateX(-60deg)}to{opacity:1;transform:none}}
        @keyframes marquee{to{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes turn{to{transform:rotate(360deg)}}
        @keyframes cue{0%{opacity:0;transform:translateY(-4px)}50%{opacity:1}100%{opacity:0;transform:translateY(10px)}}
        @keyframes introout{to{opacity:0;visibility:hidden}}
        @keyframes introline{to{width:100%}}
        .rise{animation:rise .9s cubic-bezier(.2,.7,.2,1) both}
        .swap{display:inline-block;animation:swap .6s cubic-bezier(.2,.7,.2,1) both}
        .marquee{animation:marquee 32s linear infinite}
        .marquee-rev{animation:marquee 40s linear infinite reverse}
        .float{animation:float 6s ease-in-out infinite}
        .turn{animation:turn 7s linear infinite}
        .cue{animation:cue 1.8s ease-in-out infinite}
        .intro{animation:introout .6s ease 1.25s forwards}
        .introline{width:0;animation:introline 1.05s cubic-bezier(.7,0,.2,1) .15s forwards}
        :focus-visible{outline:2px solid #fb923c;outline-offset:2px}
        @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.intro{display:none!important}}
      `}</style>

      {/* brand intro */}
      {intro && (
        <div className="intro fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[#05070D]">
          <div className="relative">
            <span className="f-d text-4xl font-extrabold sm:text-6xl">KK <span className="grad">ENGINEERING</span></span>
            <span className="introline absolute -bottom-4 left-0 h-[3px] rounded bg-gradient-to-r from-cyan-300 via-blue-400 to-orange-400" />
          </div>
          <p className="mt-10 text-xs font-semibold tracking-[0.35em] text-slate-400">HVAC & AC DUCTING · PUNE</p>
        </div>
      )}

      {/* scroll progress + cursor glow */}
      <div className="fixed left-0 top-0 z-[70] h-[3px] bg-gradient-to-r from-cyan-300 via-blue-400 to-orange-400" style={{ width: `${progress}%` }} />
      <div ref={glow} className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[400px] w-[400px] rounded-full bg-cyan-300/10 blur-3xl md:block" />

      {/* NAVBAR – floating pill */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/10 bg-[#05070D]/60 shadow-[0_10px_40px_-15px_rgba(0,0,0,.9)] backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-3">
            <button onClick={() => scrollToSection("home")} className="text-left">
              <span className="f-d block text-xl font-extrabold leading-none">KK <span className="grad">ENGINEERING</span></span>
              <span className="text-[11px] text-slate-400">HVAC & AC Ducting Services</span>
            </button>
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map(([id, l]) => (
                <button key={id} onClick={() => scrollToSection(id)} className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">{l}</button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button onClick={() => scrollToSection("quote")} className="hidden rounded-full bg-gradient-to-r from-orange-500 to-amber-300 px-5 py-2.5 text-sm font-bold text-[#05070D] transition hover:scale-105 sm:block">Get a Quote</button>
              <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-xl lg:hidden">
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
          {menuOpen && (
            <nav className="rise border-t border-white/10 px-5 pb-5 lg:hidden">
              {NAV.map(([id, l]) => (
                <button key={id} onClick={() => scrollToSection(id)} className="block w-full border-b border-white/10 py-3.5 text-left font-medium text-slate-200">{l}</button>
              ))}
              <a href={`tel:+91${PHONE_NUMBER}`} className={`${btnPrimary} mt-4 block text-center`}>Call {PHONE_NUMBER}</a>
            </nav>
          )}
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-28">
        <AirCanvas />
        <div className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-cyan-400/20 blur-[130px]" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-violet-500/20 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-[24rem] w-[24rem] rounded-full bg-orange-500/15 blur-[130px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#05070D] to-transparent" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-10 lg:grid-cols-[1.45fr_1fr] lg:items-center">
          <div>
            <p className="rise mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur" style={{ animationDelay: "0ms" }}>
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> Based in Pune, Maharashtra
            </p>
            <h1 className="f-d rise text-[clamp(2.6rem,6.4vw,5.75rem)] font-extrabold leading-[1.02]" style={{ animationDelay: "120ms" }}>
              AC ducting & HVAC work for
              <span className="mt-5 block min-h-[3.2em] text-[clamp(1.5rem,3.3vw,2.9rem)] leading-tight sm:min-h-[1.9em]">
                <span key={word} className="swap">
                  <span className="inline-flex items-center gap-3 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-2 shadow-[0_0_40px_-10px_rgba(103,232,249,.6)] backdrop-blur">
                    <span>{SECTORS[word][0]}</span>
                    <span className="grad">{SECTORS[word][1]}</span>
                  </span>
                </span>
              </span>
            </h1>
            <p className="rise mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9" style={{ animationDelay: "260ms" }}>
              KK Engineering installs ducting and HVAC systems for buildings, companies, industries and individual customers.
            </p>
            <div className="rise mt-10 flex flex-wrap gap-4" style={{ animationDelay: "400ms" }}>
              <button onClick={() => scrollToSection("contact")} className={btnPrimary}>Request a quote</button>
              <button onClick={() => scrollToSection("projects")} className={btnGhost}>See our projects</button>
            </div>
            <div className="rise mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-slate-400" style={{ animationDelay: "520ms" }}>
              {["📍 Pune based", "📋 Contract work", "💬 WhatsApp support"].map((c) => <span key={c}>{c}</span>)}
            </div>
          </div>

          <div className="float rise hidden lg:block" style={{ animationDelay: "500ms" }}>
            <div className="relative overflow-hidden rounded-[2rem] p-[1.5px]">
              <div className="turn absolute -inset-[100%] bg-[conic-gradient(from_0deg,#67e8f9,#60a5fa,#a78bfa,#fb923c,#67e8f9)]" />
              <div className="relative rounded-[calc(2rem-1.5px)] bg-[#0A0F1C]/95 p-9 backdrop-blur-xl">
                <h3 className="f-d text-3xl font-bold">What we do</h3>
                <ul className="mt-7 space-y-6">
                  {[["AC Ducting", "Duct installation and related work."], ["HVAC Work", "Installation and project support."], ["Project Contracts", "For companies, builders and customers."]].map(([t, d]) => (
                    <li key={t} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300/30 to-blue-500/20 text-cyan-200">✓</span>
                      <div><p className="text-lg font-semibold">{t}</p><p className="text-sm text-slate-400">{d}</p></div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-semibold tracking-[0.3em] text-slate-500 sm:flex">
          SCROLL
          <span className="flex h-9 w-5 justify-center rounded-full border border-white/25 pt-2"><span className="cue h-2 w-1 rounded-full bg-cyan-300" /></span>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-white/10 bg-white/[0.02] py-8 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee flex w-max items-center gap-10 whitespace-nowrap">
          {[...SERVICES, ...SERVICES].map(([, title], i) => (
            <span key={i} className="flex items-center gap-10">
              <span className={`f-d text-[clamp(2rem,5vw,4rem)] font-extrabold ${i % 2 ? "text-white" : "ol"}`}>{title}</span>
              <span className="warm text-2xl">✦</span>
            </span>
          ))}
        </div>
        <div className="marquee-rev mt-5 flex w-max items-center gap-8 whitespace-nowrap">
          {[...SECTORS, ...SECTORS, ...SECTORS, ...SECTORS].map(([icon, name], i) => (
            <span key={i} className="flex items-center gap-3 text-lg font-medium text-slate-400"><span>{icon}</span>{name}<span className="ml-5 text-cyan-300/60">•</span></span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="relative overflow-hidden py-28 md:py-36">
        <span className="ol f-d pointer-events-none absolute -bottom-10 -right-6 select-none text-[clamp(8rem,22vw,20rem)] font-extrabold leading-none opacity-40">HVAC</span>
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2 md:items-center">
          <div>
            <Head n="01" label="About">Work planned around what each project needs.</Head>
            <Reveal delay={120}>
              <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">KK Engineering is a Pune-based business providing AC ducting and HVAC-related services.</p>
              <p className="mt-4 max-w-xl text-lg leading-8 text-slate-400">We take contract work from builders, companies, industries and individual customers, based on the requirements of the project.</p>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <Tilt className="p-9 sm:p-11">
              <h3 className="f-d text-3xl font-bold">KK Engineering</h3>
              <dl className="mt-7 divide-y divide-white/10">
                {[["Owner", "Kailash Obrai"], ["Location", "Pune, Maharashtra"], ["Primary service", "AC / HVAC / AC Ducting"], ["Phone", PHONE_NUMBER]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-4"><dt className="text-cyan-300">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
                ))}
              </dl>
            </Tilt>
          </Reveal>
        </div>
      </section>

      {/* SERVICES – bento */}
      <section id="services" className="border-y border-white/10 bg-white/[0.025] py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Head n="02" label="Services" sub="Practical HVAC and air-conditioning work for different types of projects.">
            Everything your building needs to <span className="grad">breathe easy</span>
          </Head>
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {SERVICES.map(([icon, title, text, span], i) => (
              <Reveal key={title} delay={i * 80} className={span}>
                <Tilt className="h-full p-8 sm:p-9">
                  <span className="f-d ol absolute right-6 top-4 text-6xl font-extrabold opacity-70">0{i + 1}</span>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/30 to-blue-500/20 text-3xl ring-1 ring-white/10 transition duration-300 group-hover:scale-110 group-hover:rotate-3">{icon}</div>
                  <h3 className="f-d mt-8 text-2xl font-bold sm:text-3xl">{title}</h3>
                  <p className="mt-3 max-w-md leading-7 text-slate-400">{text}</p>
                  <span className="mt-6 inline-block text-xl text-cyan-300 opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100">→</span>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Head n="03" label="Process">How a project runs, from visit to handover</Head>
          <div className="relative mt-20 grid gap-12 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-cyan-300 via-blue-400 to-orange-400 md:block" />
            {STEPS.map(([title, text], i) => (
              <Reveal key={title} delay={i * 150}>
                <div className="relative">
                  <span className="f-d relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 text-2xl font-extrabold text-[#05070D] shadow-[0_0_40px_rgba(103,232,249,.55)] ring-8 ring-[#05070D]">{i + 1}</span>
                  <h3 className="f-d mt-7 text-2xl font-bold">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-400">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="border-y border-white/10 bg-white/[0.025] py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Head n="04" label="Projects" sub="HVAC and AC ducting projects handled by KK Engineering.">
            Our <span className="grad">projects</span>
          </Head>

          {loadingProjects && (
            <div className="mt-16 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((n) => <div key={n} className="h-96 animate-pulse rounded-[1.75rem] bg-white/5" />)}
            </div>
          )}
          {!loadingProjects && projectsError && (
            <div className="mt-16 rounded-3xl border border-red-400/30 bg-red-500/10 p-10 text-center">
              <h3 className="text-xl font-semibold text-red-300">Projects could not be loaded</h3>
              <p className="mt-2 text-red-200/80">Check that the backend is running and NEXT_PUBLIC_API_URL is correct, then refresh.</p>
            </div>
          )}
          {!loadingProjects && !projectsError && projects.length === 0 && (
            <div className="mt-16 rounded-3xl border border-dashed border-white/20 p-14 text-center">
              <div className="text-5xl">🏗️</div>
              <h3 className="f-d mt-4 text-2xl font-bold">No projects added yet</h3>
              <p className="mt-2 text-slate-400">Add a project from the admin dashboard and it will appear here.</p>
            </div>
          )}
          {!loadingProjects && projects.length > 0 && (
            <div className="mt-16 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <Reveal key={project.id} delay={(i % 3) * 100}>
                  <Tilt className="h-full">
                    <div className="relative h-64 overflow-hidden">
                      {project.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={getImageUrl(project.image_url)} alt={project.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-white/5 text-6xl">🏗️</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/30 to-transparent" />
                      <span className="absolute right-4 top-4 rounded-full bg-cyan-300 px-3 py-1 text-xs font-bold text-[#05070D]">{project.status}</span>
                      <h3 className="f-d absolute inset-x-6 bottom-5 text-2xl font-bold">{project.name}</h3>
                    </div>
                    <div className="p-7 pt-4">
                      <p className="text-sm font-medium text-cyan-300">📍 {project.location}</p>
                      <p className="mt-1 text-sm font-medium text-slate-300">🔧 {project.service}</p>
                      <p className="mt-4 leading-7 text-slate-400">{project.description}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why" className="py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Head n="05" label="Why us">Why choose <span className="grad">KK Engineering</span></Head>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(([icon, title, text], i) => (
              <Reveal key={title} delay={i * 100}>
                <Tilt className="h-full p-8">
                  <span className="f-d ol text-6xl font-extrabold">0{i + 1}</span>
                  <div className="mt-6 text-4xl">{icon}</div>
                  <h3 className="f-d mt-4 text-xl font-bold">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-400">{text}</p>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GET A QUOTE */}
      <section id="quote" className="border-y border-white/10 bg-white/[0.025] py-28 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <Head n="06" label="Get a quote" sub="Tell us what you need. Your details reach our team and WhatsApp opens with your message ready to send.">
              Get a quote for your <span className="grad">HVAC project</span>
            </Head>
            <Reveal delay={120}>
              <ul className="mt-9 space-y-4 text-slate-300">
                {["Fill in the short form", "We save your request and open WhatsApp", "Our team contacts you about your requirement"].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300/15 text-cyan-300">✓</span>{t}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap gap-4">
                <a href={`tel:+91${PHONE_NUMBER}`} className={`${btnGhost} !px-7 !py-3.5`}>📞 Call {PHONE_NUMBER}</a>
                <button onClick={() => openWhatsApp()} className="rounded-full bg-green-500 px-7 py-3.5 font-bold text-white shadow-[0_10px_35px_-10px_rgba(34,197,94,.8)] transition hover:-translate-y-0.5">💬 WhatsApp us</button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <div className="rounded-[2rem] bg-gradient-to-br from-cyan-300/40 via-white/10 to-orange-400/40 p-[1.5px]">
              <form onSubmit={submitEnquiry} noValidate className="space-y-5 rounded-[calc(2rem-1.5px)] bg-[#0A0F1C]/95 p-7 shadow-2xl backdrop-blur-xl sm:p-10">
                <h3 className="f-d text-3xl font-extrabold">Request a quote</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="q-name" className={label}>Your name *</label>
                    <input id="q-name" value={enquiryName} onChange={(e) => setEnquiryName(e.target.value)} placeholder="Enter your name" className={field} />
                  </div>
                  <div>
                    <label htmlFor="q-phone" className={label}>Phone number *</label>
                    <input id="q-phone" type="tel" value={enquiryPhone} onChange={(e) => setEnquiryPhone(e.target.value)} placeholder="Enter your phone number" className={field} />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="q-service" className={label}>Service required *</label>
                    <select id="q-service" value={enquiryService} onChange={(e) => setEnquiryService(e.target.value)} className={field}>
                      <option value="" className="bg-[#0A0F1C]">Select a service</option>
                      {[...SERVICES.map((x) => x[1]), "Other"].map((x) => <option key={x} value={x} className="bg-[#0A0F1C]">{x}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="q-loc" className={label}>Project location</label>
                    <input id="q-loc" value={enquiryLocation} onChange={(e) => setEnquiryLocation(e.target.value)} placeholder="Area / city" className={field} />
                  </div>
                </div>
                <div>
                  <label htmlFor="q-msg" className={label}>Project details</label>
                  <textarea id="q-msg" value={enquiryMessage} onChange={(e) => setEnquiryMessage(e.target.value)} placeholder="Type of building, size, timeline..." rows={4} className={`${field} resize-none`} />
                </div>
                {formError && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">{formError}</p>}
                {sent && <p role="status" className="rounded-xl border border-green-400/40 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-300">✓ Thank you! Your request is saved. Send the WhatsApp message that just opened so we can reach you faster.</p>}
                <button type="submit" disabled={sending} className="w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-4 text-lg font-bold text-[#05070D] shadow-[0_12px_40px_-10px_rgba(34,197,94,.8)] transition hover:-translate-y-0.5 disabled:opacity-60">
                  {sending ? "Sending..." : "💬 Get my quote on WhatsApp"}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AREAS WE SERVE */}
      <section id="areas" className="py-28 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <Head n="07" label="Areas" sub="We are based in Pune and take HVAC and AC ducting projects across the city and all over indian major city.">
              Areas we <span className="grad">serve</span>
            </Head>
            <Reveal delay={120}>
              <div className="mt-9 flex flex-wrap gap-3">
                {AREAS.map((a) => (
                  <span key={a} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-300">📍 {a}</span>
                ))}
              </div>
              <p className="mt-7 text-slate-400">
                Your area not listed?{" "}
                <button onClick={() => scrollToSection("quote")} className="font-semibold text-cyan-300 underline">Send us your location</button> and we will confirm.
              </p>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <div className="overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)]">
              <iframe
                title="KK Engineering service area map, Pune"
                src="https://www.google.com/maps?q=Pune,Maharashtra&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[420px] w-full border-0 [filter:invert(92%)_hue-rotate(180deg)_saturate(.8)_contrast(.9)]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-white/10 bg-white/[0.025] py-28 md:py-36">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
            }),
          }}
        />
        <div className="mx-auto grid max-w-7xl gap-14 px-6 md:grid-cols-[1fr_1.5fr]">
          <div>
            <Head n="08" label="FAQ" sub="Can't find your answer? Ask us on WhatsApp.">
              Frequently asked <span className="grad">questions</span>
            </Head>
            <Reveal delay={120}><button onClick={() => openWhatsApp()} className={`${btnPrimary} mt-8`}>Ask on WhatsApp</button></Reveal>
          </div>
          <div className="space-y-3">
            {FAQS.map(([q, a], i) => {
              const isOpen = faqOpen === i;
              return (
                <div key={q} className={`rounded-2xl border transition duration-300 ${isOpen ? "border-cyan-300/50 bg-white/[0.07] shadow-[0_0_40px_-15px_rgba(103,232,249,.5)]" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
                  <button onClick={() => setFaqOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-semibold">
                    {q}
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-2xl text-cyan-300 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 leading-7 text-slate-400">{a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-4 py-28 sm:px-6 md:py-36">
        <Reveal className="mx-auto max-w-7xl">
          <div
            className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-[0_40px_120px_-40px_rgba(56,189,248,.6)] sm:p-12 md:p-16"
            style={{ background: "radial-gradient(60% 80% at 0% 0%, rgba(34,211,238,.9), transparent 60%), radial-gradient(50% 70% at 100% 100%, rgba(251,146,60,.85), transparent 60%), linear-gradient(135deg,#1d4ed8,#4338ca)" }}
          >
            <div className="relative grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="f-d text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[1.04]">Ready To Start Your HVAC OR AC Ducting Project?</h2>
                <p className="mt-5 max-w-md text-lg text-white/85">Call, message on WhatsApp or send an enquiry. Tell us what you need and we will get back to you.</p>
                <dl className="mt-9 space-y-4">
                  <div><dt className="text-sm text-white/70">Phone</dt><dd><a href={`tel:+91${PHONE_NUMBER}`} className="f-d text-4xl font-bold hover:underline">{PHONE_NUMBER}</a></dd></div>
                  <div><dt className="text-sm text-white/70">Office Location</dt><dd className="text-lg font-semibold">Near Seasons Mall,Hadapsar,Pune, Maharashtra</dd></div>
                  <div><dt className="text-sm text-white/70">Owner</dt><dd className="text-lg font-semibold">Kailash Obrai</dd></div>
                </dl>
              </div>
              <div className="space-y-4">
                <a href={`tel:+91${PHONE_NUMBER}`} className="block rounded-2xl bg-white px-6 py-5 text-center text-lg font-bold text-[#05070D] shadow-xl transition hover:-translate-y-1">📞 Call {PHONE_NUMBER}</a>
                <button onClick={() => openWhatsApp()} className="block w-full rounded-2xl bg-green-500 px-6 py-5 text-center text-lg font-bold text-white shadow-xl transition hover:-translate-y-1">💬 Message on WhatsApp</button>
                <button onClick={openEnquiryForm} className="block w-full rounded-2xl border-2 border-white/60 bg-white/5 px-6 py-5 text-center text-lg font-bold backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">📝 Send an enquiry</button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="relative overflow-hidden border-t border-white/10 pt-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 md:flex-row md:items-center">
          <div>
            <p className="f-d text-xl font-extrabold">KK <span className="grad">ENGINEERING</span></p>
            <p className="mt-1 text-sm text-slate-400">HVAC & AC Ducting Services in Pune</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
            {NAV.map(([id, l]) => <button key={id} onClick={() => scrollToSection(id)} className="transition hover:text-cyan-300">{l}</button>)}
          </div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} KK Engineering. All rights reserved.</p>
        </div>
        <p className="f-d ol mt-10 select-none whitespace-nowrap text-center text-[clamp(3rem,13.5vw,12rem)] font-extrabold leading-[0.85] opacity-60" aria-hidden="true">KK ENGINEERING</p>
      </footer>

      {/* FLOATING CONTACT */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end">
        {contactOpen && (
          <div className="mb-4 flex flex-col items-end gap-3">
            {[
              { label: "WhatsApp", icon: "💬", color: "bg-green-500", onClick: () => openWhatsApp() },
              { label: "Send enquiry", icon: "📝", color: "bg-orange-500", onClick: openEnquiryForm },
            ].map((o) => (
              <button key={o.label} onClick={o.onClick} className="rise flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 text-sm font-bold text-slate-900 shadow-xl transition hover:scale-105">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg text-white ${o.color}`}>{o.icon}</span>{o.label}
              </button>
            ))}
            <a href={`tel:+91${PHONE_NUMBER}`} className="rise flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 text-sm font-bold text-slate-900 shadow-xl transition hover:scale-105">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-lg text-white">📞</span>Call now
            </a>
          </div>
        )}
        <div className="relative">
          {!contactOpen && <span className="absolute inset-0 animate-ping rounded-full bg-orange-400/60" />}
          <button onClick={() => setContactOpen(!contactOpen)} aria-label="Contact KK Engineering" aria-expanded={contactOpen} className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-300 text-2xl shadow-[0_0_40px_rgba(251,146,60,.65)] transition hover:scale-110">
            {contactOpen ? "✕" : "💬"}
          </button>
        </div>
      </div>
    </main>
  );
}

