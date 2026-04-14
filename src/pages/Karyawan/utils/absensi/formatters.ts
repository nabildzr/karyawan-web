// * This file contains formatter helpers for attendance labels, date-time text, and location text.
import type { GeocodingResponse } from "../../routes/absensi/types/AbsensiTypes";
import { SUBMISSION_TYPE_LABEL_MAP } from "./constants";

export function formatClock(date: Date) {
  // & Format the date into 12-hour time with AM/PM to create split display parts.
  // % Memformat tanggal menjadi jam 12-jam dengan AM/PM untuk membuat bagian tampilan terpisah.
  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // & Split formatted time into clock text and period, then provide a safe default.
  // % Memecah waktu terformat menjadi teks jam dan periode, lalu memberikan default aman.
  const [time, period] = timeLabel.split(" ");
  return {
    time,
    period: period ?? "AM",
  };
}

export function formatDateLabel(date: Date) {
  // & Format date with Indonesian locale for long human-readable day and calendar text.
  // % Memformat tanggal dengan locale Indonesia untuk teks hari dan kalender yang mudah dibaca.
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatShiftStart24(timeValue: string) {
  // & Split raw shift time string and normalize hour-minute output to 24-hour format.
  // % Memecah string jam shift mentah dan menormalkan output jam-menit ke format 24 jam.
  const [hourString, minuteString = "00"] = timeValue.split(":");
  const hour = Number(hourString);
  const minute = minuteString.slice(0, 2);

  // & Return original value when hour parsing fails to avoid corrupt display.
  // % Mengembalikan nilai asli saat parsing jam gagal agar tampilan tidak rusak.
  if (Number.isNaN(hour)) return timeValue;

  // & Left-pad hour and join with minute so the result is always HH:mm.
  // % Menambahkan nol di depan jam dan menggabungkannya dengan menit agar hasil selalu HH:mm.
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export function formatClock24WithSeconds(date: Date) {
  // & Format live clock in Jakarta timezone with seconds for real-time attendance UI.
  // % Memformat jam berjalan zona waktu Jakarta dengan detik untuk UI absensi real-time.
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}

export function formatIsoToTime24(iso?: string | null) {
  // & Guard against empty ISO value to prevent invalid Date formatting.
  // % Menjaga agar nilai ISO kosong tidak diproses sehingga tidak terjadi format Date invalid.
  if (!iso) return null;

  // & Convert ISO datetime into HH:mm text using Jakarta timezone.
  // % Mengonversi datetime ISO menjadi teks HH:mm dengan zona waktu Jakarta.
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}

export function formatDistance(distanceMeters: number) {
  // & Use meters for short distance and switch to kilometers for longer distance readability.
  // % Menggunakan meter untuk jarak pendek dan beralih ke kilometer agar jarak jauh lebih mudah dibaca.
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(2)} km`;
}

export function formatLocationLabel(payload: GeocodingResponse) {
  // & Resolve most relevant district-like label from reverse geocoding payload.
  // % Menentukan label wilayah paling relevan dari payload reverse geocoding.
  const district =
    payload.address?.city_district ||
    payload.address?.suburb ||
    payload.address?.city ||
    payload.address?.county ||
    payload.address?.state;

  // & Normalize country code fallback to ID and ensure uppercase display.
  // % Menormalkan fallback kode negara ke ID dan memastikan tampil huruf besar.
  const countryCode = (payload.address?.country_code || "id").toUpperCase();

  // & Prioritize district + country for concise location label.
  // % Memprioritaskan distrik + negara untuk label lokasi yang ringkas.
  if (district) {
    return `${district}, ${countryCode}`;
  }

  // & Fallback to first display_name segment when district fields are unavailable.
  // % Fallback ke segmen pertama display_name saat field distrik tidak tersedia.
  if (payload.display_name) {
    const firstPart = payload.display_name.split(",")[0]?.trim();
    if (firstPart) {
      return `${firstPart}, ${countryCode}`;
    }
  }

  // & Final fallback keeps UI deterministic even with sparse geocoding payload.
  // % Fallback terakhir menjaga UI tetap deterministik walau payload geocoding minim.
  return `Lokasi Saat Ini, ${countryCode}`;
}

export function formatSubmissionTypeLabel(type?: string | null) {
  // & Return generic label when submission type is empty.
  // % Mengembalikan label umum saat tipe pengajuan kosong.
  if (!type) return "pengajuan";

  // & Map known type keys to friendly labels, otherwise fallback to lowercase raw type.
  // % Memetakan key tipe yang dikenal ke label ramah, jika tidak pakai tipe mentah huruf kecil.
  return SUBMISSION_TYPE_LABEL_MAP[type] ?? type.toLowerCase();
}
