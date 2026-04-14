// * File route karyawan: attendanceFlow/ResultPage.tsx
// & Result page renders success or failure summary from persisted flow state.
// % Halaman result menampilkan ringkasan sukses atau gagal dari state flow tersimpan.
import { AlertTriangle, CheckCircle2, Clock3, LocateFixed, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ATTENDANCE_FLOW_ERROR_MESSAGES,
  getAttendanceFlowResult,
  isResultStateValid,
  resetAttendanceFlowResult,
} from "./flowStore";
import { formatActionLabel, formatDateTime } from "./utils/formatters";

// & Main component for post-processing result display and redirect behavior.
// % Komponen utama untuk tampilan hasil pasca-processing dan perilaku redirect.
const ResultPage = () => {
  const navigate = useNavigate();
  const toastShownRef = useRef(false);

  const [flowState, setFlowState] = useState(() => getAttendanceFlowResult());
  const [countdown, setCountdown] = useState(3);

  // & Validate persisted result state and recover to capture flow if invalid.
  // % Validasi state hasil tersimpan dan kembali ke flow capture jika tidak valid.
  useEffect(() => {
    const latest = getAttendanceFlowResult();

    if (!isResultStateValid(latest)) {
      resetAttendanceFlowResult();
      navigate("/karyawan/absensi", { replace: true });
      return;
    }

    setFlowState(latest);
  }, [navigate]);

  // & Show success toast once and auto-redirect user after countdown.
  // % Tampilkan toast sukses sekali lalu redirect otomatis setelah hitung mundur.
  useEffect(() => {
    if (flowState.status !== "success") return;

    if (!toastShownRef.current) {
      toast.success("Absensi berhasil disimpan.");
      toastShownRef.current = true;
    }

    setCountdown(3);

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          resetAttendanceFlowResult();
          navigate("/karyawan", { replace: true });
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [flowState.status, navigate]);

  // & Derive localized failure metadata from structured error code.
  // % Turunkan metadata gagal yang terlokalisasi dari kode error terstruktur.
  const failureMeta = useMemo(() => {
    if (!flowState.errorCode) return null;
    return ATTENDANCE_FLOW_ERROR_MESSAGES[flowState.errorCode];
  }, [flowState.errorCode]);

  if (!isResultStateValid(flowState)) {
    return null;
  }

  if (flowState.status === "failed") {
    return (
      <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#fecaca,_#fff1f2_45%,_#ffe4e6_100%)] px-4 py-8">
        <section className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 shadow-lg">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-rose-100">
            <AlertTriangle size={36} className="text-rose-600" />
          </div>

          <h1 className="text-center text-2xl font-bold text-rose-700">Absensi Gagal</h1>
          <p className="mt-2 text-center text-sm text-rose-900">
            {failureMeta?.title ?? "Terjadi kesalahan pada proses absensi"}
          </p>

          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {failureMeta?.description ?? flowState.errorMessage ?? "Silakan coba kembali."}
          </p>

          {flowState.errorMessage ? (
            <p className="mt-3 text-xs text-rose-700">Detail: {flowState.errorMessage}</p>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                resetAttendanceFlowResult();
                navigate("/karyawan/absensi/capture", { replace: true });
              }}
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Coba Lagi
            </button>
            <button
              type="button"
              onClick={() => {
                resetAttendanceFlowResult();
                navigate("/karyawan", { replace: true });
              }}
              className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              Ke Beranda
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#bbf7d0,_#f0fdf4_42%,_#dcfce7_100%)] px-4 py-8">
      <section className="w-full max-w-md rounded-3xl border border-emerald-200 bg-white p-6 shadow-lg">
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 size={36} className="text-emerald-600" />
        </div>

        <h1 className="text-center text-2xl font-bold text-emerald-700">Absensi Berhasil</h1>
        <p className="mt-2 text-center text-sm text-emerald-900">
          Data absensi Anda sudah tercatat dengan aman.
        </p>

        <div className="mt-5 space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="flex items-center gap-2">
            <UserRound size={15} />
            Nama: <span className="font-semibold">{flowState.employeeName ?? "-"}</span>
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            Jenis: <span className="font-semibold">{formatActionLabel(flowState.actionType)}</span>
          </p>
          <p className="flex items-center gap-2">
            <Clock3 size={15} />
            Waktu: <span className="font-semibold">{formatDateTime(flowState.timestamp)}</span>
          </p>
          <p className="flex items-center gap-2">
            <LocateFixed size={15} />
            Lokasi: <span className="font-semibold">{flowState.locationLabel ?? "-"}</span>
          </p>
          <p className="text-xs text-emerald-700">
            Confidence wajah: {flowState.confidence?.toFixed(2) ?? "-"}%
          </p>
        </div>

        <p className="mt-5 text-center text-sm font-semibold text-emerald-700">
          Mengalihkan ke beranda dalam {countdown} detik...
        </p>
      </section>
    </div>
  );
};

export default ResultPage;
