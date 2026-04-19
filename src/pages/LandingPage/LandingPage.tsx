// * Frontend module: karyawan-web/src/pages/LandingPage/LandingPage.tsx
// & This file defines frontend UI or logic for LandingPage.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk LandingPage.tsx.

import { Link } from "react-router";

// ── Navbar ────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">AttendEase</span>
        </div>

        {/* Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-gray-600 transition hover:text-gray-900">Features</a>
          <a href="#solutions" className="text-sm text-gray-600 transition hover:text-gray-900">Solutions</a>
          <a href="#pricing" className="text-sm text-gray-600 transition hover:text-gray-900">Pricing</a>
          <a href="#about" className="text-sm text-gray-600 transition hover:text-gray-900">About</a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/signin"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Login
          </Link>
          <Link
            to="/admin/signin"
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Hero Section ──────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row lg:gap-16">
        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Next-Gen HR Tech
          </div>

          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Effortless{" "}
            <span className="text-blue-500">Attendance</span>{" "}
            Management
          </h1>

          <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-500 lg:mx-0 mx-auto">
            Streamline your workforce tracking with our AI-powered biometric and real-time reporting system.
            Say goodbye to manual logs and greeting accuracy.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start justify-center">
            <Link
              to="/admin/signin"
              className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-600 hover:shadow-blue-500/40"
            >
              Get Started Free
            </Link>
            <button
              type="button"
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Request Demo
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center gap-3 lg:justify-start justify-center">
            <div className="flex -space-x-2">
              {["bg-blue-400", "bg-indigo-400", "bg-cyan-400"].map((color, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full border-2 border-white ${color} flex items-center justify-center text-xs font-bold text-white`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Joined by <span className="font-semibold text-gray-700">2,000+</span> companies globally
            </p>
          </div>
        </div>

        {/* Illustration / Dashboard Preview */}
        <div className="flex-1 w-full max-w-lg">
          <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl shadow-gray-200/80">
            {/* Mock top bar */}
            <div className="mb-5 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="ml-3 flex-1 rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-400">
                app.attendease.com/dashboard
              </div>
            </div>

            {/* Mock dashboard grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Hadir Hari Ini", value: "142", color: "bg-blue-50 text-blue-600", icon: "👥" },
                { label: "Tepat Waktu", value: "96%", color: "bg-green-50 text-green-600", icon: "✅" },
                { label: "Terlambat", value: "6", color: "bg-amber-50 text-amber-600", icon: "⏰" },
                { label: "Tidak Hadir", value: "3", color: "bg-red-50 text-red-600", icon: "❌" },
              ].map((card) => (
                <div key={card.label} className={`rounded-xl ${card.color} p-3`}>
                  <div className="text-xl mb-1">{card.icon}</div>
                  <div className="text-xl font-bold">{card.value}</div>
                  <div className="text-xs opacity-70">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Mock bar chart */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="mb-3 text-xs font-medium text-gray-500">Kehadiran Minggu Ini</p>
              <div className="flex items-end gap-2 h-16">
                {[70, 85, 60, 90, 75, 40, 55].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-blue-400 transition-all"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[9px] text-gray-400">{["S", "M", "T", "W", "T", "F", "S"][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-4 -top-4 rounded-xl bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
              Live ✦
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats Section ─────────────────────────────────────────────
const STATS = [
  {
    label: "Active Users",
    value: "50,000+",
    sub: "+15% this month",
    subColor: "text-green-500",
    subIcon: "↑",
  },
  {
    label: "Accuracy Rate",
    value: "99.9%",
    sub: "Industry leading AI",
    subColor: "text-blue-500",
    subIcon: "◎",
  },
  {
    label: "Time Saved",
    value: "40%",
    sub: "Reduction in manual logs",
    subColor: "text-amber-500",
    subIcon: "↓",
  },
];

function StatsSection() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <p className="mb-1 text-sm text-gray-400">{s.label}</p>
              <p className="mb-1 text-3xl font-extrabold text-gray-800">{s.value}</p>
              <p className={`text-sm font-medium ${s.subColor}`}>
                {s.subIcon} {s.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features Section ──────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Biometric & Face ID",
    desc: "Secure and touchless clock-in options using advanced AI facial recognition and fingerprint scanning.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Real-time Dashboard",
    desc: "Monitor attendance, late arrivals, and absences as they happen across all your locations.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Easy Reporting",
    desc: "Generate comprehensive attendance reports with just a few clicks ready for payroll export.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Shift Scheduling",
    desc: "Create and manage complex employee shifts and rotations effortlessly with drag-and-drop tools.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-500">
            Platform Features
          </p>
          <h2 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Powerful Features for Modern HR
          </h2>
          <p className="mx-auto max-w-xl text-base text-gray-500">
            Everything you need to manage your team's presence effectively with an all-in-one centralized platform.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition">
                {f.icon}
              </div>
              <h3 className="mb-2 font-semibold text-gray-800">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────
function CTASection() {
  return (
    <section className="bg-blue-500 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
          Ready to transform your workforce management?
        </h2>
        <p className="mb-8 text-base text-blue-100">
          Join thousands of companies using AttendEase to automate attendance and focus on what matters most.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/admin/signin"
            className="rounded-xl bg-white px-7 py-3 text-sm font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50"
          >
            Get Started Now
          </Link>
          <button
            type="button"
            className="rounded-xl border border-blue-300 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────
const FOOTER_LINKS = {
  Product: ["Features", "Biometrics", "Integrations", "API Reference"],
  Company: ["About Us", "Careers", "Blog", "Contact"],
  Support: ["Help Center", "Security", "Terms of Service", "Privacy Policy"],
};

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">AttendEase</span>
            </div>
            <p className="mb-4 max-w-xs text-sm leading-relaxed text-gray-500">
              The smart way to manage your modern workforce. AI-powered, reliable, and user-friendly.
            </p>
            <div className="flex items-center gap-3">
              {[
                <path key="share" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />,
                <path key="globe" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />,
                <path key="mail" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-blue-300 hover:text-blue-500"
                  aria-label="social link"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {p}
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 transition hover:text-gray-900"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 text-center">
          <p className="text-xs text-gray-400">© 2024 AttendEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans antialiased">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
