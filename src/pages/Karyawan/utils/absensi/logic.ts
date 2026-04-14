// * This file contains core attendance business logic and non-formatting calculations.
import type { TodayAttendanceContext } from "../../../../types/attendances.types";
import type { PreferredActionResolution } from "../../routes/absensi/types/AbsensiTypes";
import { EARTH_RADIUS_IN_METERS, LOCATION_ERROR_MESSAGES } from "./constants";

// & Describe the minimum shape of working schedule day used by local schedule resolver.
// % Menjelaskan bentuk minimum data hari jadwal kerja yang dipakai resolver jadwal lokal.
export interface ScheduleDayLike {
  dayOfWeek: string;
  isActive: boolean;
  shift?: { startTime: string } | null;
}

export function isSameLocalDay(dateInput?: string | null, refDate = new Date()) {
  // & Return false early when date input is absent.
  // % Mengembalikan false lebih awal saat input tanggal tidak ada.
  if (!dateInput) return false;

  // & Parse input date once so date parts can be compared safely.
  // % Parsing tanggal input sekali agar bagian tanggal dapat dibandingkan dengan aman.
  const date = new Date(dateInput);

  // & Compare year, month, and day to ensure both timestamps are in the same local day bucket.
  // % Membandingkan tahun, bulan, dan hari untuk memastikan kedua timestamp berada pada bucket hari lokal yang sama.
  return (
    date.getFullYear() === refDate.getFullYear() &&
    date.getMonth() === refDate.getMonth() &&
    date.getDate() === refDate.getDate()
  );
}

export function getTodayScheduleStart(days: ScheduleDayLike[] = []) {
  // & Return null when schedule list is empty so caller can apply fallback time.
  // % Mengembalikan null saat daftar jadwal kosong agar pemanggil bisa memakai fallback waktu.
  if (!days.length) return null;

  // & Get weekday names in English and Indonesian because backend day data may use either language.
  // % Mengambil nama hari dalam bahasa Inggris dan Indonesia karena data hari backend bisa memakai salah satunya.
  const englishName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
  const indonesianName = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
  });

  // & Build lowercase set for case-insensitive matching against schedule day names.
  // % Membuat set huruf kecil untuk pencocokan nama hari jadwal yang tidak sensitif huruf besar-kecil.
  const dayNames = new Set([englishName.toLowerCase(), indonesianName.toLowerCase()]);

  // & Find today's schedule and ensure it is active with a defined shift start time.
  // % Mencari jadwal hari ini dan memastikan jadwal aktif dengan jam masuk shift yang terdefinisi.
  const todaySchedule = days.find((item) => dayNames.has(item.dayOfWeek.toLowerCase()));
  if (!todaySchedule?.isActive || !todaySchedule.shift?.startTime) return null;

  // & Return shift start time string when today's active schedule is valid.
  // % Mengembalikan string jam masuk shift saat jadwal aktif hari ini valid.
  return todaySchedule.shift.startTime;
}

export function distanceInMeters(source: [number, number], target: [number, number]) {
  // & Convert degrees to radians for trigonometric distance formula.
  // % Mengonversi derajat ke radian untuk rumus jarak trigonometri.
  const toRadians = (value: number) => (value * Math.PI) / 180;

  // & Unpack source and target coordinates for clearer math expressions.
  // % Mengurai koordinat asal dan tujuan agar ekspresi perhitungan lebih jelas.
  const [sourceLat, sourceLng] = source;
  const [targetLat, targetLng] = target;

  // & Compute latitude and longitude deltas in radians.
  // % Menghitung selisih lintang dan bujur dalam radian.
  const latitudeDelta = toRadians(targetLat - sourceLat);
  const longitudeDelta = toRadians(targetLng - sourceLng);

  // & Calculate Haversine value as the base for angular distance.
  // % Menghitung nilai Haversine sebagai dasar jarak sudut.
  const haversineValue =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(sourceLat)) *
      Math.cos(toRadians(targetLat)) *
      Math.sin(longitudeDelta / 2) ** 2;

  // & Convert Haversine value into angular distance in radians.
  // % Mengonversi nilai Haversine menjadi jarak sudut dalam radian.
  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

  // & Multiply by earth radius to get final distance in meters.
  // % Mengalikan dengan jari-jari bumi untuk mendapatkan jarak akhir dalam meter.
  return EARTH_RADIUS_IN_METERS * angularDistance;
}

export function resolvePreferredAction(
  context?: TodayAttendanceContext | null,
): PreferredActionResolution {
  // & Default to no action when context is unavailable.
  // % Default ke tanpa aksi saat konteks tidak tersedia.
  if (!context) {
    return {
      actionType: null,
      lockReason: null,
    };
  }

  // & Prioritize check-out when user already checked in and check-out is allowed.
  // % Memprioritaskan check-out saat user sudah check-in dan check-out diizinkan.
  if (context.canCheckOut && context.attendance?.checkIn && !context.attendance?.checkOut) {
    return {
      actionType: "CHECK_OUT",
      lockReason: null,
    };
  }

  // & Otherwise allow check-in if backend marks check-in as available.
  // % Jika tidak, izinkan check-in apabila backend menandai check-in tersedia.
  if (context.canCheckIn) {
    return {
      actionType: "CHECK_IN",
      lockReason: null,
    };
  }

  // & Return locked state with the best available reason from context fields.
  // % Mengembalikan status terkunci dengan alasan terbaik dari field konteks yang tersedia.
  return {
    actionType: null,
    lockReason:
      context.checkOutLockReason ??
      context.checkInLockReason ??
      context.lockReason ??
      "Absensi tidak tersedia saat ini.",
  };
}

export function getLocationErrorMessage(error: GeolocationPositionError) {
  // & Map geolocation permission-denied error to a clear actionable message.
  // % Memetakan error izin lokasi ditolak ke pesan yang jelas dan bisa ditindaklanjuti.
  if (error.code === error.PERMISSION_DENIED) {
    return LOCATION_ERROR_MESSAGES.PERMISSION_DENIED;
  }

  // & Map position-unavailable error to guidance about device location services.
  // % Memetakan error lokasi tidak tersedia ke panduan layanan lokasi perangkat.
  if (error.code === error.POSITION_UNAVAILABLE) {
    return LOCATION_ERROR_MESSAGES.POSITION_UNAVAILABLE;
  }

  // & Map timeout error to retry guidance.
  // % Memetakan error timeout ke arahan untuk mencoba ulang.
  if (error.code === error.TIMEOUT) {
    return LOCATION_ERROR_MESSAGES.TIMEOUT;
  }

  // & Use default message for unknown geolocation error codes.
  // % Menggunakan pesan default untuk kode error geolokasi yang tidak dikenali.
  return LOCATION_ERROR_MESSAGES.DEFAULT;
}
