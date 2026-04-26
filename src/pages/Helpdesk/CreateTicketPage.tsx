// * Page: Tambah Tiket Baru (USER)
// * Editor sederhana + subject suggestions dari API

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ComponentCard from "../../components/common/ComponentCard";
import {
  useCreateTicket,
  useSimilarTickets,
  useSubjectSuggestions,
} from "../../hooks/useHelpdesk";
import type { TicketPriority } from "../../types/helpdesk.types";
import TiptapEditor from "./TiptapEditor";

// ── Priority config ───────────────────────────────────────────────────
const PRIORITY_OPTIONS: {
  label: string;
  value: TicketPriority;
  color: string;
}[] = [
  {
    label: "Low",
    value: "LOW",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  },
  {
    label: "Medium",
    value: "MEDIUM",
    color: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  },
  {
    label: "High",
    value: "HIGH",
    color: "text-rose-400 bg-rose-400/10 border-rose-400/30",
  },
];

// ── Main Page ─────────────────────────────────────────────────────────
export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { mutateAsync: createTicket, isPending } = useCreateTicket();

  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [descHtml, setDescHtml] = useState("");
  const [descPlain, setDescPlain] = useState("");
  const [debouncedSubject, setDebouncedSubject] = useState("");
  const [debouncedDescription, setDebouncedDescription] = useState("");

  const suggestionRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [] as string[] } = useSubjectSuggestions(subject);
  const { data: similarTickets = [] } = useSimilarTickets({
    subject: debouncedSubject,
    description: debouncedDescription,
    limit: 5,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      // debounced value untuk mengurangi frekuensi request similar tickets saat user mengetik
      setDebouncedSubject(subject);
      setDebouncedDescription(descPlain);
    }, 3000);
    return () => clearTimeout(timer);
  }, [subject, descPlain]);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function handleEditorChange(html: string, plain: string) {
    setDescHtml(html);
    setDescPlain(plain);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!subject.trim() || subject.length < 5) {
      toast.error("Subject minimal 5 karakter");
      return;
    }
    if (descPlain.trim().length < 10) {
      toast.error("Deskripsi minimal 10 karakter");
      return;
    }

    try {
      const description = descHtml || `<p>${descPlain}</p>`;
      await createTicket({ subject: subject.trim(), description, priority });
      toast.success("Tiket berhasil dibuat");
      navigate("/karyawan/helpdesk");
    } catch {
      // error sudah ditangani apiClient interceptor
      
    }
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Buat Tiket Baru
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Laporkan masalah atau pertanyaan kamu ke tim support.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
          </div>
        </div>

        <ComponentCard title="Form Tiket" desc="Isi subject, prioritas, dan deskripsi masalah secara lengkap.">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative" ref={suggestionRef}>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (e.target.value.length >= 3) setShowSuggestions(true);
                  }}
                  onFocus={() => subject.length >= 3 && setShowSuggestions(true)}
                  placeholder="Contoh: Laptop tidak bisa login"
                  minLength={5}
                  maxLength={255}
                  className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 pr-14 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                  required
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
                  {subject.length}/255
                </span>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                  {suggestions.map((s: string) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSubject(s);
                        setShowSuggestions(false);
                      }}
                      className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/[0.04]"
                    >
                      <span className="mr-2 text-brand-500">→</span>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      priority === opt.value
                        ? `${opt.color} ring-2 ring-brand-500/20`
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Deskripsi <span className="text-rose-500">*</span>
              </label>
              <TiptapEditor value={descPlain} onChange={handleEditorChange} />
            </div>

            {similarTickets.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    Tiket Serupa Ditemukan
                  </p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-200/80">
                    Cek dulu sebelum kirim tiket baru untuk menghindari duplikasi.
                  </p>
                </div>

                <div className="space-y-2">
                  {similarTickets.map((item) => (
                    <button
                      key={item.ticket.id}
                      type="button"
                      onClick={() => navigate(`/karyawan/helpdesk/${item.ticket.id}`)}
                      className="w-full rounded-lg border border-amber-200 bg-white px-3 py-3 text-left transition hover:border-amber-300 hover:bg-amber-50/60 dark:border-amber-500/30 dark:bg-white/[0.03] dark:hover:bg-amber-500/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {item.ticket.subject}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.ticket.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                          {item.similarity}% mirip
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-2 sm:flex-row dark:border-gray-800">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Mengirim..." : "Kirim Tiket"}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
