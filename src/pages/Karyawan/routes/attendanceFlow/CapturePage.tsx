// * File route karyawan: attendanceFlow/CapturePage.tsx
// & Capture page runs camera checks and stores valid snapshot for processing.
// % Halaman capture menjalankan cek kamera lalu menyimpan snapshot valid untuk processing.
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Camera,
  CircleCheck,
  CircleX,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthContext } from "../../../../context/AuthContext";
import { attendancesService } from "../../../../services/attendances.service";
import { detectAccessories, requestBlipCaption } from "./flowService";
import { resetAttendanceFlowResult, setAttendanceFlowResult } from "./flowStore";
import { resolveAttendanceAction } from "./utils/attendanceAction";
import {
  analyzeFrameBrightness,
  blobToDataUrl,
  INITIAL_VALIDATION,
  type ValidationState,
} from "./utils/captureValidation";
import {
  CHECK_INTERVAL_MS,
  ENFORCE_ACCESSORY_VALIDATION,
  MAX_BRIGHTNESS,
  MAX_BRIGHTNESS_GAP,
  MIN_BRIGHTNESS,
} from "./utils/constants";

const FALLBACK_CAPTION_ERROR = "Layanan caption AI tidak tersedia.";

// & Normalize caption service errors for UI display.
// % Normalisasi error layanan caption untuk tampilan UI.
const resolveCaptionErrorMessage = (error: unknown) => {
  if (!ENFORCE_ACCESSORY_VALIDATION) {
    return FALLBACK_CAPTION_ERROR;
  }

  return error instanceof Error
    ? error.message
    : "Gagal menjalankan validasi aksesori.";
};

// & Main component for capture and pre-submit validation step.
// % Komponen utama untuk tahap capture dan validasi sebelum submit.
const CapturePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const validatingRef = useRef(false);
  const lockHandledRef = useRef(false);
  const captionFallbackRef = useRef(false);
  const submitGuardRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState<ValidationState>(INITIAL_VALIDATION);

  const { data: todayContext, isLoading: isContextLoading } = useQuery({
    queryKey: ["attendances", "today-context", "capture-flow"],
    queryFn: () => attendancesService.getTodayContext("Asia/Jakarta"),
    enabled: !!user,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    retry: 1,
  });

  const captureAction = useMemo(
    () => resolveAttendanceAction(todayContext),
    [todayContext],
  );

  useEffect(() => {
    if (!todayContext) return;

    if (captureAction.actionType) {
      lockHandledRef.current = false;
      return;
    }

    if (lockHandledRef.current) return;
    lockHandledRef.current = true;

    resetAttendanceFlowResult();
    toast.error(captureAction.lockReason ?? "Absensi sedang terkunci.");
    navigate("/karyawan/absensi", { replace: true });
  }, [captureAction.actionType, captureAction.lockReason, navigate, todayContext]);

  // & Capture current video frame into a compressed JPEG blob.
  // % Tangkap frame video saat ini menjadi blob JPEG terkompresi.
  const captureFrameBlob = async (): Promise<Blob | null> => {
    const video = videoRef.current;
    const canvas = analysisCanvasRef.current;

    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    const targetWidth = 360;
    const targetHeight = 480;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
    });
  };

  // & Initialize front camera stream and bind it to video element.
  // % Inisialisasi stream kamera depan lalu pasang ke elemen video.
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Browser tidak mendukung akses kamera.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 720 },
            height: { ideal: 960 },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play().catch(() => undefined);

        setCameraReady(true);
        setCameraError(null);
      } catch {
        setCameraError(
          "Izin kamera ditolak atau perangkat kamera tidak tersedia.",
        );
      }
    };

    void initCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // & Run periodic validation over frame brightness and accessory detection.
  // % Jalankan validasi berkala untuk brightness frame dan deteksi aksesori.
  useEffect(() => {
    if (!cameraReady || cameraError) return;

    let stopped = false;

    const runValidation = async () => {
      if (stopped || validatingRef.current || isSubmitting) return;

      validatingRef.current = true;
      setIsAnalyzing(true);

      try {
        const frameBlob = await captureFrameBlob();
        if (!frameBlob) {
          setValidation((prev) => ({
            ...prev,
            captionError: "Frame kamera belum siap.",
          }));
          return;
        }

        const canvas = analysisCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { avgBrightness, brightnessGap } = analyzeFrameBrightness(imageData);

        let caption = "";
        let accessories: string[] = [];
        let captionError: string | null = null;

        if (captionFallbackRef.current && !ENFORCE_ACCESSORY_VALIDATION) {
          accessories = ["unverified"];
          captionError = FALLBACK_CAPTION_ERROR;
        } else {
          try {
            const captionResult = await requestBlipCaption(frameBlob);
            caption = captionResult.caption;
            accessories = detectAccessories(caption);
            captionFallbackRef.current = false;
          } catch (error) {
            captionError = resolveCaptionErrorMessage(error);
            accessories = ["unverified"];

            if (!ENFORCE_ACCESSORY_VALIDATION) {
              captionFallbackRef.current = true;
            }
          }
        }

        setValidation({
          faceStraight: brightnessGap <= MAX_BRIGHTNESS_GAP,
          lightEnough:
            avgBrightness >= MIN_BRIGHTNESS && avgBrightness <= MAX_BRIGHTNESS,
          noAccessories: accessories.length === 0,
          avgBrightness,
          brightnessGap,
          accessories,
          caption,
          captionError,
          lastUpdatedAt: Date.now(),
        });
      } finally {
        validatingRef.current = false;
        setIsAnalyzing(false);
      }
    };

    void runValidation();
    const timer = window.setInterval(() => {
      void runValidation();
    }, CHECK_INTERVAL_MS);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [cameraReady, cameraError, isSubmitting]);

  // & Compute final eligibility for enabling capture submit button.
  // % Hitung kelayakan akhir untuk mengaktifkan tombol submit capture.
  const allValid = useMemo(
    () =>
      cameraReady &&
      !cameraError &&
      !isContextLoading &&
      !!captureAction.actionType &&
      validation.faceStraight &&
      validation.lightEnough &&
      (validation.noAccessories ||
        (!ENFORCE_ACCESSORY_VALIDATION &&
          validation.accessories.includes("unverified"))) &&
      (ENFORCE_ACCESSORY_VALIDATION ? !validation.captionError : true),
    [cameraError, cameraReady, captureAction.actionType, isContextLoading, validation],
  );

  const accessoryText = useMemo(() => {
    if (validation.accessories.length === 0) return "Tidak terdeteksi";
    if (validation.accessories.includes("unverified")) return "Belum tervalidasi";
    return validation.accessories.join(", ");
  }, [validation.accessories]);

  const lastCheckText = useMemo(() => {
    if (!validation.lastUpdatedAt) return "Belum ada validasi";

    return new Date(validation.lastUpdatedAt).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });
  }, [validation.lastUpdatedAt]);

  const showCaptionFallbackHint = useMemo(
    () =>
      !ENFORCE_ACCESSORY_VALIDATION &&
      validation.accessories.includes("unverified"),
    [validation.accessories],
  );

  const captionErrorText = useMemo(() => {
    if (!validation.captionError) return null;

    // & Do not show fallback warning to avoid distracting the user.
    // % Jangan tampilkan peringatan fallback agar tidak mengganggu user.
    if (showCaptionFallbackHint) {
      return null;
    }

    return validation.captionError;
  }, [showCaptionFallbackHint, validation.captionError]);

  const handleCaptureAndContinue = async () => {
    if (!allValid || isSubmitting || submitGuardRef.current) return;

    if (!todayContext || !captureAction.actionType) {
      toast.error(captureAction.lockReason ?? "Absensi tidak tersedia saat ini.");
      return;
    }

    // & Guard immediate duplicate taps before React state updates propagate.
    // % Cegah tap ganda instan sebelum update state React selesai menyebar.
    submitGuardRef.current = true;
    setIsSubmitting(true);

    try {
      const frameBlob = await captureFrameBlob();
      if (!frameBlob) {
        throw new Error("Gagal mengambil gambar dari kamera.");
      }

      const dataUrl = await blobToDataUrl(frameBlob);

      setAttendanceFlowResult({
        stage: "CAPTURED",
        status: "idle",
        captureDataUrl: dataUrl,
        actionType: captureAction.actionType,
        employeeName: user?.employees?.fullName ?? user?.nip ?? "Karyawan",
        timestamp: null,
        locationLabel: null,
        confidence: null,
        errorCode: null,
        errorMessage: null,
        attendanceId: null,
        capturedAt: new Date().toISOString(),
        processedAt: null,
        contextDateKey: todayContext.dateKey,
      });

      navigate("/karyawan/absensi/processing", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengambil foto absensi.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      submitGuardRef.current = false;
    }
  };

  const validationRows = [
    {
      label: "Posisi wajah lurus",
      ok: validation.faceStraight,
      detail: `Selisih kiri-kanan: ${validation.brightnessGap.toFixed(1)}`,
    },
    {
      label: "Pencahayaan memadai",
      ok: validation.lightEnough,
      detail: `Brightness rata-rata: ${validation.avgBrightness.toFixed(1)} (target 50-220)`,
    },
    {
      label: "Tanpa aksesori wajah",
      ok:
        validation.noAccessories ||
        (!ENFORCE_ACCESSORY_VALIDATION &&
          validation.accessories.includes("unverified")),
      detail: `Deteksi BLIP: ${accessoryText}`,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_#fff7ed_45%,_#fffbeb_100%)] px-4 pb-8 pt-6 text-slate-900">
      <canvas ref={analysisCanvasRef} className="hidden" />

      <header className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/karyawan/absensi")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-wide text-amber-100">
          ATTENDANCE CAMERA
        </div>
      </header>

      {isContextLoading ? (
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-theme-xs">
          Memeriksa status absensi hari ini...
        </section>
      ) : null}

      <section className="mb-4 rounded-3xl border border-amber-200 bg-white/85 p-4 shadow-lg backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-700">Face Recognition</p>
            <h1 className="text-lg font-bold">Ready to Capture</h1>
          </div>
          <div className="rounded-2xl bg-amber-100 px-3 py-2 text-right text-xs font-semibold text-amber-800">
            <p>{user?.employees?.fullName ?? user?.nip ?? "Karyawan"}</p>
            <p className="text-[11px] text-amber-700">Last check: {lastCheckText}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-amber-300 bg-slate-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-[420px] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_transparent_35%,_rgba(0,0,0,0.55)_100%)]" />
          <div className="pointer-events-none absolute inset-x-10 top-10 rounded-[40px] border-2 border-dashed border-amber-200/70 p-1">
            <div className="h-[300px] rounded-[36px] border border-amber-100/60" />
          </div>
          {!cameraReady && (
            <div className="absolute inset-0 grid place-items-center bg-black/70 text-sm font-medium text-white">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Menyiapkan kamera...
              </span>
            </div>
          )}
          {cameraError && (
            <div className="absolute inset-0 grid place-items-center bg-black/80 p-4 text-center text-sm font-medium text-rose-100">
              {cameraError}
            </div>
          )}
        </div>
      </section>

      <section className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
            <ShieldCheck size={16} className="text-emerald-600" />
            Validasi Real-time (2 detik)
          </h2>
          {isAnalyzing ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Loader2 size={13} className="animate-spin" />
              Menganalisa...
            </span>
          ) : null}
        </div>

        <div className="space-y-2">
          {validationRows.map((row) => (
            <article
              key={row.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{row.label}</p>
                {row.ok ? (
                  <CircleCheck size={16} className="text-emerald-600" />
                ) : (
                  <CircleX size={16} className="text-rose-500" />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">{row.detail}</p>
            </article>
          ))}
        </div>

        {captionErrorText ? (
          <p
            className={`mt-3 rounded-xl px-3 py-2 text-xs ${
              ENFORCE_ACCESSORY_VALIDATION
                ? "border border-rose-200 bg-rose-50 text-rose-700"
                : "border border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {captionErrorText}
          </p>
        ) : validation.caption ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Caption BLIP: {validation.caption}
          </p>
        ) : null}
      </section>

      <section className="mb-5 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="inline-flex items-center gap-2 font-semibold">
          <Sparkles size={16} />
          "Posisikan wajah lurus, lepaskan aksesori wajah, dan pastikan cahaya merata."
        </p>
      </section>

      <button
        type="button"
        onClick={() => {
          void handleCaptureAndContinue();
        }}
        disabled={!allValid || isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold tracking-wide text-amber-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        {captureAction.actionType === "CHECK_OUT" ? "Ambil Foto Check-Out" : "Ambil Foto Check-In"}
      </button>
    </div>
  );
};

export default CapturePage;
