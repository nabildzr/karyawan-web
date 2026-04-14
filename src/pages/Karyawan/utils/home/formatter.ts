// * This file provides formatter helpers for home-page shift and submission labels.
export function formatSubmissionTypeLabel(type?: string | null) {
  // & Use generic label when submission type is not available.
  // % Menggunakan label umum saat tipe pengajuan tidak tersedia.
  if (!type) return "Pengajuan";

  // & Map known backend enum values into friendly Indonesian display text.
  // % Memetakan nilai enum backend yang dikenal menjadi teks tampilan Indonesia yang ramah.
  if (type === "IZIN_SAKIT") return "Izin Sakit";
  if (type === "IZIN_KHUSUS") return "Izin Khusus";
  if (type === "DINAS_LUAR") return "Dinas Luar";
  if (type === "LEMBUR") return "Lembur";
  if (type === "GANTI_SHIFT_HARI") return "Ganti Shift Hari";

  // & Keep original value for unknown types to avoid losing information.
  // % Menjaga nilai asli untuk tipe yang tidak dikenal agar informasi tidak hilang.
  return type;
}

export function formatUnlockTimeLabel(iso?: string | null) {
  // & Return null for empty unlock time input to simplify caller guards.
  // % Mengembalikan null untuk input unlock time kosong agar guard di pemanggil lebih sederhana.
  if (!iso) return null;

  // & Parse unlock timestamp once before validating it.
  // % Parsing timestamp unlock satu kali sebelum divalidasi.
  const unlockDate = new Date(iso);

  // & Stop formatting when parsed date is invalid.
  // % Menghentikan proses format jika hasil parsing tanggal tidak valid.
  if (Number.isNaN(unlockDate.getTime())) return null;

  // & Format unlock time into HH:mm Jakarta time for lock hint messages.
  // % Memformat waktu unlock menjadi HH:mm waktu Jakarta untuk pesan petunjuk lock.
  return unlockDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}
