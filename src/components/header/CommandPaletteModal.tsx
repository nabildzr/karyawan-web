// * Frontend module: karyawan-web/src/components/header/CommandPaletteModal.tsx
// & This file defines frontend UI or logic for CommandPaletteModal.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk CommandPaletteModal.tsx.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

// ── Route registry ────────────────────────────────────────────
export interface RouteItem {
  label: string;
  path: string;
  group: string;
  icon: React.ReactNode;
  keywords?: string;
}

const baseRoutes: RouteItem[] = [
  // ── Utama ──
  {
    group: "Utama",
    label: "Dashboard",
    path: "/",
    keywords: "home beranda overview",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    group: "Utama",
    label: "Profil",
    path: "/profile",
    keywords: "profile akun user",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    group: "Utama",
    label: "Kalender",
    path: "/calendar",
    keywords: "calendar jadwal tanggal",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },

  // ── Master Data Hierarki ──
  {
    group: "Master Data Hierarki",
    label: "Divisi",
    path: "/divisi",
    keywords: "divisi departemen",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    group: "Master Data Hierarki",
    label: "Jabatan",
    path: "/jabatan",
    keywords: "jabatan posisi role",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },

  // ── Master Data Pengguna ──
  {
    group: "Master Data Pengguna",
    label: "Karyawan",
    path: "/karyawan",
    keywords: "karyawan pegawai staff",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    group: "Master Data Pengguna",
    label: "Manajemen Wajah",
    path: "/manajemen-wajah",
    keywords: "wajah face biometric",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },

  // ── Jadwal Kerja ──
  {
    group: "Jadwal Kerja",
    label: "Jadwal Kerja",
    path: "/jadwal-kerja",
    keywords: "jadwal shift schedule",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    group: "Jadwal Kerja",
    label: "Manajemen Libur",
    path: "/manajemen-libur",
    keywords: "libur holiday cuti",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },

  // ── Absensi ──
  {
    group: "Absensi",
    label: "Daftar Absensi",
    path: "/daftar-absensi",
    keywords: "absensi hadir kehadiran list",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    group: "Absensi",
    label: "Koreksi Absensi",
    path: "/koreksi-absensi",
    keywords: "koreksi edit ubah absensi",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    group: "Absensi",
    label: "Absensi Manual",
    path: "/absensi-manual",
    keywords: "absensi manual input",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    group: "Absensi",
    label: "Geofences",
    path: "/geofences",
    keywords: "geofence lokasi area peta map",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    group: "Absensi",
    label: "Daftar Pengajuan",
    path: "/admin/daftar-pengajuan",
    keywords: "pengajuan izin request",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },

  // ── Penilaian ──
  {
    group: "Penilaian",
    label: "Input Penilaian",
    path: "/input-penilaian",
    keywords: "penilaian assessment evaluasi input",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    group: "Penilaian",
    label: "Penilaian per Divisi",
    path: "/penilaian-per-divisi",
    keywords: "penilaian divisi hr admin dashboard",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h10M4 17h16" />
      </svg>
    ),
  },
  {
    group: "Penilaian",
    label: "Manajemen Kategori",
    path: "/manajemen-kategori",
    keywords: "kategori penilaian kriteria",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    group: "Penilaian",
    label: "Laporan Penilaian",
    path: "/laporan-penilaian",
    keywords: "laporan penilaian report",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },

  // ── Laporan ──
  {
    group: "Laporan",
    label: "Laporan per Divisi",
    path: "/laporan-per-divisi",
    keywords: "laporan divisi report",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    group: "Laporan",
    label: "Laporan Seluruh Karyawan",
    path: "/laporan-seluruh-karyawan",
    keywords: "laporan semua karyawan global",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    group: "Laporan",
    label: "Laporan Absensi",
    path: "/laporan-absensi",
    keywords: "laporan absensi kehadiran report",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    group: "Laporan",
    label: "Laporan Pengajuan",
    path: "/laporan-pengajuan",
    keywords: "laporan pengajuan izin report",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },

  // ── Logs ──
  {
    group: "Logs",
    label: "Audit Logs",
    path: "/audit-logs",
    keywords: "audit log aktivitas history",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const routes: RouteItem[] = baseRoutes.map((route) => ({
  ...route,
  path: route.path === "/" ? "/admin" : `/admin${route.path}`,
}));

// Group color accent map
const GROUP_COLORS: Record<string, string> = {
  "Utama": "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  "Master Data Hierarki": "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  "Master Data Pengguna": "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  "Jadwal Kerja": "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  "Absensi": "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  "Penilaian": "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  "Laporan": "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  "Logs": "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

// ── Component ─────────────────────────────────────────────────
interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Filter routes
  const filtered = query.trim()
    ? routes.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.label.toLowerCase().includes(q) ||
          r.group.toLowerCase().includes(q) ||
          (r.keywords ?? "").toLowerCase().includes(q)
        );
      })
    : routes;

  // Group filtered results
  const grouped = filtered.reduce<Record<string, RouteItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  // Flat list for keyboard navigation
  const flat = filtered;

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        const item = flat[activeIndex];
        if (item) { navigate(item.path); onClose(); }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, flat, activeIndex, navigate, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  // Flat index counter as we render groups
  let flatIdx = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[999998] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[10vh] z-[999999] mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5 dark:border-gray-700/60">
            <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari halaman atau fitur..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none dark:text-white dark:placeholder:text-gray-500"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <kbd className="hidden rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-800 sm:block">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
            {Object.keys(grouped).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tidak ada hasil untuk "{query}"</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Coba kata kunci lain</p>
              </div>
            ) : (
              Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-1">
                  {/* Group header */}
                  <p className="mb-1 mt-2 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    {group}
                  </p>

                  {/* Items */}
                  {items.map((item) => {
                    const idx = flatIdx++;
                    const isActive = activeIndex === idx;
                    const colorCls = GROUP_COLORS[group] ?? "bg-gray-100 text-gray-600";

                    return (
                      <button
                        key={item.path}
                        data-idx={idx}
                        onClick={() => handleNavigate(item.path)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          isActive
                            ? "bg-brand-50 dark:bg-brand-500/10"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {/* Icon */}
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorCls}`}>
                          {item.icon}
                        </span>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium leading-none ${isActive ? "text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-gray-200"}`}>
                            {item.label}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">{item.path}</p>
                        </div>

                        {/* Arrow */}
                        {isActive && (
                          <svg className="h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2.5 dark:border-gray-700/60">
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px] dark:border-gray-700 dark:bg-gray-800">↑↓</kbd>
              Navigasi
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px] dark:border-gray-700 dark:bg-gray-800">↵</kbd>
              Buka
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px] dark:border-gray-700 dark:bg-gray-800">ESC</kbd>
              Tutup
            </span>
            <span className="ml-auto text-[11px] text-gray-300 dark:text-gray-600">
              {filtered.length} halaman tersedia
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
