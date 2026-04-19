// * Frontend module: karyawan-web/src/pages/admin/Penilaian/PenilaianPerDivisi.tsx
// & This file defines frontend UI or logic for PenilaianPerDivisi.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk PenilaianPerDivisi.tsx.

import { useMemo } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { type Column } from "../../../components/tables/DataTables/DataTable";
import { useDivisi } from "../../../hooks/useDivisi";
import type { Division } from "../../../types/hierarki.types";

export default function PenilaianPerDivisi() {
  const navigate = useNavigate();
  const { divisions, loading, error } = useDivisi();

  const totalKaryawanPerDivisi = useMemo(
    () =>
      new Map(
        divisions.map((division) => {
          // Reduce dipakai untuk menjumlahkan seluruh employee di semua jabatan.
          // `?? 0` menjaga kalkulasi tetap aman saat posisi belum punya array employees.
          const totalEmployees = (division.positions ?? []).reduce(
            (sum, position) => sum + (position.employees?.length ?? 0),
            0,
          );

          return [division.id, totalEmployees];
        }),
      ),
    [divisions],
  );

  const columns: Column<Division>[] = [
    {
      header: "Nama Divisi",
      accessor: "name",
    },
    {
      header: "Manager",
      render: (row) =>
        row.manager?.employees?.fullName ?? (
          <span className="italic text-gray-400">Belum ditetapkan</span>
        ),
    },
    {
      header: "Jabatan",
      width: "w-28",
      render: (row) => `${row.positions?.length ?? 0} jabatan`,
    },
    {
      header: "Total Karyawan",
      width: "w-32",
      render: (row) => `${totalKaryawanPerDivisi.get(row.id) ?? 0} orang`,
    },
    {
      header: "Aksi",
      width: "w-44",
      render: (row) => (
        <button
          onClick={() =>
            navigate(`/admin/penilaian-per-divisi/${row.id}/dashboard`, {
              state: { divisionName: row.name },
            })
          }
          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
        >
          Lihat Dashboard
        </button>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Penilaian Karyawan per Divisi"
        description="Pilih divisi untuk melihat dashboard penilaian karyawan"
      />
      <PageBreadcrumb pageTitle="Penilaian Karyawan per Divisi" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Penilaian Karyawan per Divisi
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
            Pilih divisi untuk membuka dashboard penilaian versi Admin/HR. Dashboard ini dipakai untuk melihat progres evaluasi seluruh anggota divisi, termasuk posisi managerial yang perlu dinilai oleh atasan di level berikutnya.
          </p>
        </div>

        <ComponentCard
          title="Daftar Divisi"
          desc={`${divisions.length} divisi tersedia untuk dipantau`}
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={divisions}
              pageSize={10}
              searchKeys={["name"]}
            />
          )}
        </ComponentCard>
      </div>
    </>
  );
}
