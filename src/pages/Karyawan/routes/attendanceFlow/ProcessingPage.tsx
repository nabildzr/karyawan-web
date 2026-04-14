// * File route karyawan: attendanceFlow/ProcessingPage.tsx
// & Processing page executes secure attendance pipeline and writes final flow state.
// % Halaman processing mengeksekusi pipeline absensi aman lalu menulis state akhir flow.
import {
  CheckCircle2,
  Loader2,
  LocateFixed,
  ScanFace,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthContext } from "../../../../context/AuthContext";
import { attendancesService } from "../../../../services/attendances.service";
import { verifyFaceByBackend } from "./flowService";
import {
  getAttendanceFlowResult,
  isCaptureStateValid,
  resetAttendanceFlowResult,
  setAttendanceFlowResult,
} from "./flowStore";
import { resolveAttendanceAction } from "./utils/attendanceAction";
import {
  FACE_CONFIDENCE_THRESHOLD,
  PROCESS_STEPS,
  STEP_MIN_DURATION_MS,
} from "./utils/constants";
import { extractErrorMessage, FlowProcessError, inferErrorCode } from "./utils/errors";
import { dataUrlToFile, getDeviceLocation, wait } from "./utils/helpers";

const PROCESSING_LOCK_STORAGE_KEY = "attendance-flow-processing-lock-v1";
const PROCESSING_LOCK_MAX_AGE_MS = 2 * 60 * 1000;

type ProcessingLockPayload = {
  key: string;
  createdAt: number;
};

const canUseSessionStorage = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

// & Build deterministic lock key for one capture-processing transaction.
// % Bangun kunci lock deterministik untuk satu transaksi capture-processing.
const buildProcessingLockKey = (
  capturedAt: string | null,
  actionType: string | null,
  contextDateKey: string | null,
) => `${capturedAt ?? "-"}|${actionType ?? "-"}|${contextDateKey ?? "-"}`;

// & Read processing lock from session storage and drop stale payload.
// % Baca lock processing dari session storage dan buang payload kedaluwarsa.
const getProcessingLock = (): ProcessingLockPayload | null => {
  if (!canUseSessionStorage()) return null;

  const raw = window.sessionStorage.getItem(PROCESSING_LOCK_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ProcessingLockPayload;
    if (!parsed?.key || typeof parsed.createdAt !== "number") {
      window.sessionStorage.removeItem(PROCESSING_LOCK_STORAGE_KEY);
      return null;
    }

    if (Date.now() - parsed.createdAt > PROCESSING_LOCK_MAX_AGE_MS) {
      window.sessionStorage.removeItem(PROCESSING_LOCK_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.sessionStorage.removeItem(PROCESSING_LOCK_STORAGE_KEY);
    return null;
  }
};

// & Persist lock payload to prevent duplicate submissions across remounts.
// % Simpan payload lock untuk mencegah submit ganda antar remount.
const setProcessingLock = (payload: ProcessingLockPayload) => {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(PROCESSING_LOCK_STORAGE_KEY, JSON.stringify(payload));
};

// & Clear processing lock conditionally to avoid deleting other transaction locks.
// % Bersihkan lock processing secara kondisional agar tidak menghapus lock transaksi lain.
const clearProcessingLock = (expectedKey?: string) => {
  if (!canUseSessionStorage()) return;

  if (!expectedKey) {
    window.sessionStorage.removeItem(PROCESSING_LOCK_STORAGE_KEY);
    return;
  }

  const current = getProcessingLock();
  if (current?.key === expectedKey) {
    window.sessionStorage.removeItem(PROCESSING_LOCK_STORAGE_KEY);
  }
};

// & Main component for sequential attendance processing and result handoff.
// % Komponen utama untuk pemrosesan absensi berurutan dan handoff hasil.
const ProcessingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedStep, setCompletedStep] = useState(-1);
  const [statusText, setStatusText] = useState("Memulai proses...");

  const stepStatuses = useMemo<Array<"pending" | "active" | "done">>(
    () =>
      PROCESS_STEPS.map((_, index) => {
        if (index <= completedStep) return "done";
        if (index === currentStep) return "active";
        return "pending";
      }),
    [completedStep, currentStep],
  );

  useEffect(() => {
    let cancelled = false;

    // & Run one step with minimum display duration for stable progress UX.
    // % Jalankan satu step dengan durasi tampil minimum agar UX progress stabil.
    const runStep = async <T,>(
      index: number,
      label: string,
      task: () => Promise<T>,
    ): Promise<T> => {
      setCurrentStep(index);
      setStatusText(label);

      const started = Date.now();
      const result = await task();
      const elapsed = Date.now() - started;

      if (elapsed < STEP_MIN_DURATION_MS) {
        await wait(STEP_MIN_DURATION_MS - elapsed);
      }

      setCompletedStep(index);
      return result;
    };

    // & Execute end-to-end attendance flow with locking and error normalization.
    // % Eksekusi flow absensi end-to-end dengan lock dan normalisasi error.
    const processAttendance = async () => {
      const flowState = getAttendanceFlowResult();
      let contextDateKey = flowState.contextDateKey;
      const lockKey = buildProcessingLockKey(
        flowState.capturedAt,
        flowState.actionType,
        flowState.contextDateKey,
      );

      if (!isCaptureStateValid(flowState)) {
        resetAttendanceFlowResult();
        toast.error("Sesi absensi tidak valid. Mulai ulang dari halaman absensi.");
        navigate("/karyawan/absensi", { replace: true });
        return;
      }

      const existingLock = getProcessingLock();
      if (existingLock?.key === lockKey) {
        setStatusText("Menunggu proses absensi sebelumnya...");

        const startedAt = Date.now();
        while (!cancelled && Date.now() - startedAt < 30_000) {
          const latest = getAttendanceFlowResult();
          if (latest.stage === "RESULT_READY") {
            await wait(250);
            navigate("/karyawan/absensi/result", { replace: true });
            return;
          }

          await wait(250);
        }

        clearProcessingLock(lockKey);
      }

      setProcessingLock({
        key: lockKey,
        createdAt: Date.now(),
      });

      try {
        setAttendanceFlowResult({
          ...flowState,
          stage: "PROCESSING",
        });

        if (!flowState.captureDataUrl) {
          resetAttendanceFlowResult();
          toast.error("Foto absensi tidak ditemukan. Silakan ulangi dari awal.");
          navigate("/karyawan/absensi", { replace: true });
          return;
        }

        const imageFile = dataUrlToFile(flowState.captureDataUrl);

        const context = await runStep(
          0,
          "Membaca status absensi hari ini...",
          () => attendancesService.getTodayContext("Asia/Jakarta"),
        );
        contextDateKey = context.dateKey;

        if (!isCaptureStateValid(flowState, context.dateKey)) {
          resetAttendanceFlowResult();
          toast.error("Sesi absensi kedaluwarsa. Silakan mulai lagi.");
          navigate("/karyawan/absensi", { replace: true });
          return;
        }

        const action = resolveAttendanceAction(context);
        if (!action.actionType) {
          resetAttendanceFlowResult();
          toast.error(action.lockReason ?? "Absensi sedang terkunci.");
          navigate("/karyawan/absensi", { replace: true });
          return;
        }

        if (flowState.actionType && flowState.actionType !== action.actionType) {
          resetAttendanceFlowResult();
          toast.error("Aksi absensi tidak cocok. Mulai ulang dari halaman absensi.");
          navigate("/karyawan/absensi", { replace: true });
          return;
        }

        const faceVerification = await runStep(
          1,
          "Mencocokkan wajah Anda...",
          () => verifyFaceByBackend(imageFile),
        );

        if (!faceVerification.isMatch) {
          throw new FlowProcessError(
            "FACE_NOT_MATCH",
            "Wajah tidak cocok dengan data yang terdaftar.",
          );
        }

        if (faceVerification.confidence < FACE_CONFIDENCE_THRESHOLD) {
          throw new FlowProcessError(
            "LOW_CONFIDENCE",
            `Kemiripan wajah terlalu rendah (${faceVerification.confidence.toFixed(2)}%).`,
          );
        }

        const location = await getDeviceLocation();

        const submitResult = await runStep(
          2,
          "Mengirim data absensi ke server...",
          () => {
            if (action.actionType === "CHECK_IN") {
              return attendancesService.checkIn({
                image: imageFile,
                latitude: location.latitude,
                longitude: location.longitude,
                deviceInfo: navigator.userAgent,
                timezone: "Asia/Jakarta",
              });
            }

            return attendancesService.checkOut({
              image: imageFile,
              latitude: location.latitude,
              longitude: location.longitude,
              deviceInfo: navigator.userAgent,
              timezone: "Asia/Jakarta",
            });
          },
        );

        await runStep(3, "Menyusun hasil akhir...", async () => {
          await wait(120);
        });

        const attendanceTimestamp =
          action.actionType === "CHECK_IN"
            ? submitResult.attendance.checkIn
            : submitResult.attendance.checkOut;

        setAttendanceFlowResult({
          ...flowState,
          stage: "RESULT_READY",
          status: "success",
          actionType: action.actionType,
          employeeName:
            submitResult.attendance.employeeName ??
            user?.employees?.fullName ??
            user?.nip ??
            "Karyawan",
          timestamp: attendanceTimestamp,
          locationLabel: location.label,
          confidence: faceVerification.confidence,
          errorCode: null,
          errorMessage: null,
          attendanceId: submitResult.attendance.id,
          processedAt: new Date().toISOString(),
          contextDateKey,
        });
      } catch (error) {
        const message = extractErrorMessage(error);
        const code =
          error instanceof FlowProcessError ? error.code : inferErrorCode(message);

        setAttendanceFlowResult({
          ...flowState,
          stage: "RESULT_READY",
          status: "failed",
          actionType: null,
          timestamp: null,
          locationLabel: null,
          confidence: null,
          errorCode: code,
          errorMessage: message,
          attendanceId: null,
          processedAt: new Date().toISOString(),
          contextDateKey,
        });
      } finally {
        clearProcessingLock(lockKey);
      }

      if (cancelled) return;

      await wait(500);
      navigate("/karyawan/absensi/result", { replace: true });
    };

    void processAttendance();

    return () => {
      cancelled = true;
    };
  }, [navigate, user?.employees?.fullName, user?.nip]);

  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(145deg,_#0f172a,_#1e293b,_#334155)] px-4 py-8 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-center">
          <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-sky-300/30 bg-sky-500/20">
            <Loader2 className="animate-spin text-sky-200" size={40} />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold">Processing...</h1>
        <p className="mt-2 text-center text-sm text-slate-300">{statusText}</p>

        <div className="mt-6 space-y-2.5">
          {PROCESS_STEPS.map((step, index) => {
            const status = stepStatuses[index];

            return (
              <article
                key={step}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-2"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-800/80">
                  {status === "done" ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : status === "active" ? (
                    <Loader2 size={15} className="animate-spin text-sky-300" />
                  ) : (
                    <Sparkles size={14} className="text-slate-500" />
                  )}
                </span>
                <p
                  className={`text-sm ${
                    status === "pending" ? "text-slate-400" : "text-slate-100"
                  }`}
                >
                  {step}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-[11px] uppercase tracking-wide text-slate-300">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
            <ScanFace size={14} className="mx-auto mb-1" />
            Face AI
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
            <LocateFixed size={14} className="mx-auto mb-1" />
            Geofence
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
            <ShieldCheck size={14} className="mx-auto mb-1" />
            Secure
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProcessingPage;
