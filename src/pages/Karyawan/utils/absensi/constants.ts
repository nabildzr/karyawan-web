// * This file stores reusable constants for employee attendance utilities.
import type { CSSProperties } from "react";

// & Define decorative map pattern style for optional map-related UI backgrounds.
// % Mendefinisikan gaya pola peta dekoratif untuk latar UI terkait peta.
export const MAP_PATTERN_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(35deg, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(-25deg, rgba(255,255,255,0.12) 1px, transparent 1px), radial-gradient(circle at 25% 18%, rgba(255,255,255,0.22) 2px, transparent 2px)",
  backgroundSize: "58px 58px, 88px 88px, 110px 110px",
};

// & Define Earth's radius constant for Haversine distance calculation.
// % Mendefinisikan konstanta jari-jari bumi untuk perhitungan jarak Haversine.
export const EARTH_RADIUS_IN_METERS = 6371000;

// & Map backend submission type keys to user-friendly lowercase Indonesian labels.
// % Memetakan key tipe pengajuan dari backend ke label Indonesia huruf kecil yang ramah pengguna.
export const SUBMISSION_TYPE_LABEL_MAP: Record<string, string> = {
  IZIN_SAKIT: "izin sakit",
  IZIN_KHUSUS: "izin khusus",
  DINAS_LUAR: "dinas luar",
  LEMBUR: "lembur",
  GANTI_SHIFT_HARI: "ganti shift hari",
};

// & Centralize geolocation error messages so logic can stay clean and consistent.
// % Memusatkan pesan error geolokasi agar logika tetap bersih dan konsisten.
export const LOCATION_ERROR_MESSAGES = {
  PERMISSION_DENIED:
    "Akses lokasi ditolak. Aktifkan izin lokasi di browser agar bisa melanjutkan absensi.",
  POSITION_UNAVAILABLE:
    "Lokasi tidak tersedia. Pastikan GPS/lokasi perangkat sudah menyala.",
  TIMEOUT: "Permintaan lokasi timeout. Coba aktifkan lokasi lalu ulangi.",
  DEFAULT: "Gagal mendapatkan lokasi. Pastikan lokasi perangkat aktif lalu coba lagi.",
} as const;
