// * This file defines route module logic for src/pages/Karyawan/routes/absensi/detail/index.tsx.

import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    MapPin,
    ShieldCheck,
    Text,
} from "lucide-react";
import { useCallback, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { attendancesService } from "../../../../../services/attendances.service";
import type {
    AttendanceRecord,
    AttendanceStatus,
} from "../../../../../types/attendances.types";

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; className: string }> = {
  PRESENT: {
    label: "Hadir",
    className:
      "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  },
  LATE: {
    label: "Terlambat",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  ABSENT: {
    label: "Absen",
    className: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
  LEAVE: {
    label: "Cuti/Izin",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
};

function formatDateLabel(iso?: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}

function formatTime(iso?: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}

function formatCoordinate(value?: number | null) {
  if (value == null) return "-";
  return value.toFixed(6);
}

function StatusBadge({
  status,
  emptyLabel = "-",
}: {
  status?: AttendanceStatus | null;
  emptyLabel?: string;
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-300">
        {emptyLabel}
      </span>
    );
  }

  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.ABSENT;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-700">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-right text-xs font-medium text-gray-700 dark:text-gray-200">
        {value}
      </span>
    </div>
  );
}

const KaryawanAttendanceDetailPage = () => {
  const navigate = useNavigate();
  const { attendanceId } = useParams<{ attendanceId: string }>();

  const {
    data: detail,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AttendanceRecord>({
    queryKey: ["karyawan-attendance-detail", attendanceId],
    queryFn: () => attendancesService.getMyById(attendanceId ?? ""),
    enabled: Boolean(attendanceId),
    retry: 1,
  });

  const handleBack = useCallback(() => {
    const historyState = window.history.state as { idx?: number } | null;

    if (typeof historyState?.idx === "number" && historyState.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/karyawan/dompet");
  }, [navigate]);

  if (!attendanceId) {
    return (
      <div className="min-h-full bg-gray-50 px-4 pb-10 pt-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-theme-xs">
          ID absensi tidak valid.
        </section>
      </div>
    );
  }

  const errorMessage =
    error instanceof Error ? error.message : "Gagal memuat detail absensi.";

  return (
    <div className="min-h-full bg-gray-50 px-4 pb-10 pt-6 text-gray-900">
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <header className="mb-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-theme-xs">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Detail Absensi
        </p>
        <h1 className="mt-1 text-lg font-bold text-gray-900">Lihat Detail Absensi</h1>
        <p className="mt-1 text-xs text-gray-500">ID: {attendanceId}</p>
      </header>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white"
            />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 shadow-theme-xs">
          <p className="font-semibold">Terjadi kendala saat memuat detail absensi.</p>
          <p className="mt-1 text-xs text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-xl border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            Coba lagi
          </button>
        </section>
      )}

      {!isLoading && !isError && detail && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-theme-xs">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Ringkasan</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {formatDateLabel(detail.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={detail.status} />
                {detail.statusCheckOut && (
                  <StatusBadge status={detail.statusCheckOut} />
                )}
              </div>
            </div>

            <InfoRow label="Shift" value={detail.shiftNameSnapshot ?? "-"} />
            <InfoRow
              label="Status Masuk"
              value={<StatusBadge status={detail.status} emptyLabel="-" />}
            />
            <InfoRow
              label="Status Pulang"
              value={<StatusBadge status={detail.statusCheckOut} emptyLabel="Belum check-out" />}
            />
            <InfoRow
              label="Token Dipakai"
              value={detail.usedTokenId ?? "Tidak ada"}
            />
            <InfoRow
              label="Dicatat Pada"
              value={formatDateTime(detail.createdAt)}
            />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-theme-xs">
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <Clock3 className="h-4 w-4" />
              Absensi Masuk
            </p>

            <InfoRow
              label="Jam Terjadwal"
              value={formatTime(detail.expectedCheckInSnapshot)}
            />
            <InfoRow label="Jam Aktual" value={formatTime(detail.checkIn)} />
            <InfoRow
              label="Lokasi Check-In"
              value={detail.geofences?.name ?? "-"}
            />
            <InfoRow
              label="Koordinat"
              value={`${formatCoordinate(detail.latitudeCheckInSnapshot)}, ${formatCoordinate(detail.longitudeCheckInSnapshot)}`}
            />
            <InfoRow
              label="Radius"
              value={
                detail.radiusCheckInSnapshot != null
                  ? `${detail.radiusCheckInSnapshot} m`
                  : "-"
              }
            />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-theme-xs">
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <CalendarDays className="h-4 w-4" />
              Absensi Keluar
            </p>

            <InfoRow
              label="Jam Terjadwal"
              value={formatTime(detail.expectedCheckOutSnapshot)}
            />
            <InfoRow label="Jam Aktual" value={formatTime(detail.checkOut)} />
            <InfoRow
              label="Lokasi Check-Out"
              value={detail.geofencesCheckOut?.name ?? "-"}
            />
            <InfoRow
              label="Koordinat"
              value={`${formatCoordinate(detail.latitudeCheckOutSnapshot)}, ${formatCoordinate(detail.longitudeCheckOutSnapshot)}`}
            />
            <InfoRow
              label="Radius"
              value={
                detail.radiusCheckOutSnapshot != null
                  ? `${detail.radiusCheckOutSnapshot} m`
                  : "-"
              }
            />
          </section>

          {(detail.manualNotes || detail.manualReason || detail.isManualEntry) && (
            <section className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-4 shadow-theme-xs">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-700">
                <Text className="h-4 w-4" />
                Catatan Manual
              </p>
              <InfoRow
                label="Tipe"
                value={detail.isManualEntry ? "Manual" : "Otomatis"}
              />
              <InfoRow label="Alasan" value={detail.manualReason ?? "-"} />
              <InfoRow label="Catatan" value={detail.manualNotes ?? "-"} />
            </section>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-theme-xs">
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <MapPin className="h-4 w-4" />
              Lokasi & Device
            </p>
            <InfoRow label="Area Check-In" value={detail.geofences?.name ?? "-"} />
            <InfoRow
              label="Area Check-Out"
              value={detail.geofencesCheckOut?.name ?? "-"}
            />
            <InfoRow label="Device Info" value={detail.deviceInfo ?? "-"} />
          </section>

          {(detail.checkInPhoto || detail.checkOutPhoto) && (
            <section className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-theme-xs">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <ShieldCheck className="h-4 w-4" />
                Foto Verifikasi
              </p>
              <div className="flex flex-col gap-2 text-xs">
                {detail.checkInPhoto && (
                  <a
                    href={detail.checkInPhoto}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-brand-600 transition hover:bg-gray-50"
                  >
                    Lihat Foto Check-In
                  </a>
                )}
                {detail.checkOutPhoto && (
                  <a
                    href={detail.checkOutPhoto}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-brand-600 transition hover:bg-gray-50"
                  >
                    Lihat Foto Check-Out
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default KaryawanAttendanceDetailPage;
