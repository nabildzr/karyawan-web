// * Dashboard widget: tabel absensi terkini hari ini.
// * Renamed & rethemed from RecentOrders.tsx.

import { useNavigate } from "react-router-dom";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import type { AttendanceRecord } from "../../../types/attendances.types";

interface Props {
  records: AttendanceRecord[];
}

const STATUS_COLOR = {
  PRESENT: "success",
  LATE: "warning",
  ABSENT: "error",
  LEAVE: "info",
} as const;

const STATUS_LABEL: Record<string, string> = {
  PRESENT: "Hadir",
  LATE: "Terlambat",
  ABSENT: "Alpa",
  LEAVE: "Izin/Cuti",
};

function fmt(iso?: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
}

export default function RecentAttendance({ records }: Props) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Absensi Terkini</h3>
        <button
          onClick={() => navigate("/admin/daftar-absensi")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Lihat Semua
        </button>
      </div>

      {records.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">Belum ada data absensi hari ini.</p>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                {["Nama Karyawan", "Jabatan", "Check-In", "Check-Out", "Status"].map((h) => (
                  <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {r.employee?.fullName ?? "-"}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {r.employee?.user?.nip ?? ""}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {r.employee?.position?.name ?? "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {fmt(r.checkIn)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {fmt(r.checkOut)}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={STATUS_COLOR[r.status] ?? "light"}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
