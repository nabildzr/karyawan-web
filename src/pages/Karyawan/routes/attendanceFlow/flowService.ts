// * File route karyawan: attendanceFlow/flowService.ts
// & This file handles backend bridge calls for attendance flow validations.
// % File ini menangani panggilan bridge ke backend untuk validasi flow absensi.
import { apiClient } from "../../../../api/apiClient";

// * Service ini menangani request backend untuk validasi flow absensi.

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

export interface FaceVerificationResult {
  isMatch: boolean;
  confidence: number;
}

export interface BlipCaptionResult {
  caption: string;
}

const ACCESSORY_REGEX = /(sunglasses|glasses|eyeglasses|spectacles|mask|face mask|hat|cap)/g;

// & Wrap async requests with an AbortController-based timeout.
// % Bungkus request async dengan timeout berbasis AbortController.
const withTimeout = async <T>(
  runner: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await runner(controller.signal);
  } finally {
    window.clearTimeout(timeoutId);
  }
};

// & Detect face accessory keywords from BLIP caption output.
// % Deteksi kata kunci aksesori wajah dari hasil caption BLIP.
export const detectAccessories = (caption: string): string[] => {
  const normalized = caption.toLowerCase();
  const matched = normalized.match(ACCESSORY_REGEX) ?? [];
  return Array.from(new Set(matched));
};

// & Request AI caption from BLIP endpoint with timeout protection.
// % Minta caption AI dari endpoint BLIP dengan perlindungan timeout.
export const requestBlipCaption = async (blob: Blob): Promise<BlipCaptionResult> => {
  return withTimeout(async (signal) => {
    const form = new FormData();
    form.append("image", blob, "capture.jpg");

    const res = await apiClient.post<ApiResponse<{ caption: string }>>(
      "/attendances/blip-caption",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
      },
    );

    const caption = res.data.data?.caption;
    if (typeof caption !== "string" || caption.trim().length === 0) {
      throw new Error("Response caption dari BLIP tidak valid.");
    }

    return { caption };
  }, 9000);
};

// & Verify face match against enrolled face data in backend.
// % Verifikasi kecocokan wajah terhadap data wajah terdaftar di backend.
export const verifyFaceByBackend = async (
  imageFile: File,
): Promise<FaceVerificationResult> => {
  const form = new FormData();
  form.append("image", imageFile);

  const res = await withTimeout(
    (signal) =>
      apiClient.post<ApiResponse<{ isMatch: boolean; confidence: number }>>(
        "/attendances/verify-face",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          signal,
        },
      ),
    12000,
  );

  return {
    isMatch: !!res.data.data.isMatch,
    confidence: Number(res.data.data.confidence ?? 0),
  };
};
